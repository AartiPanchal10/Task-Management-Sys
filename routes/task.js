const router = require("express").Router();
const Task = require("../models/task.js");
const User = require("../models/user.js");
const authenticateToken = require("./auth.js");
const nodemailer = require("nodemailer");

// Email transport setup (unchanged)
const auth = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    port: 465,
    auth: {
        user: "aarti.panchal@softude.com",
        pass: "xveo dizd kxnm bhxq"
    }
});

// Helper function to send email
const sendEmail = async (to, subject, text) => {
    const receiver = {
        from: "aarti.panchal@softude.com",
        to,
        subject,
        text
    };

    try {
        await auth.sendMail(receiver);
        console.log("Email sent successfully!");
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

// Create a new task
router.post("/create-task", authenticateToken, async (req, res) => {
    try {
        const { title, description, assignedTo, dueDate } = req.body;
        const assignedBy = req.user.id || req.headers.id;

        const newTask = new Task({ title, description, assignedTo, assignedBy, dueDate });
        const savedTask = await newTask.save();

        await User.findByIdAndUpdate(assignedBy, { $push: { createdTasks: savedTask._id } });

        if (assignedTo !== assignedBy) {
            await User.findByIdAndUpdate(assignedTo, { $push: { assignedTasks: savedTask._id } });
        }

        const assignedUser = await User.findById(assignedTo);
        const creatorUser = await User.findById(assignedBy);

        if (assignedUser) {
            await sendEmail(
                assignedUser.email,
                "New Task Assigned",
                `Hello ${assignedUser.username},\n\nA new task has been assigned to you:\n\nTask ID: ${savedTask._id}\nTitle: ${title}\nAssigned By: ${creatorUser.username}\nDue Date: ${new Date(dueDate).toLocaleDateString()}\n\nPlease log in to your account to view more details.`
            );
        }

        res.status(200).json({ message: "Task Created", task: savedTask });
    } catch (error) {
        console.error("Error creating task:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


// Get all tasks for a user
router.get("/get-all-tasks", authenticateToken, async (req, res) => {
    try {
        const userId = req.headers.id;
        
        // Find the user and populate both assignedTasks and createdTasks
        const user = await User.findById(userId)
            .populate('assignedTasks')
            .populate('createdTasks');
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Merge the two lists into a single array of tasks
        const allTasks = [...user.createdTasks, ...user.assignedTasks];
        
        res.status(200).json({ allTasks });
    } catch (error) {
        console.error("Error getting tasks:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});



// Delete a task
router.delete("/delete-task/:id", authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.headers.id;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (!task.assignedBy || task.assignedBy.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to delete this task" });
        }

        await Task.findByIdAndDelete(taskId);

        if (task.assignedBy) {
            await User.findByIdAndUpdate(task.assignedBy, { $pull: { createdTasks: taskId } });
        }

        if (task.assignedTo) {
            const assignedUser = await User.findById(task.assignedTo);
            if (assignedUser) {
                await sendEmail(
                    assignedUser.email,
                    "Task Deleted",
                    `Hello ${assignedUser.username},\n\nA task assigned to you has been deleted:\n\nTask ID: ${taskId}\nTitle: ${task.title}\n\nPlease log in to your account for more information.`
                );
            }
        }

        res.status(200).json({ message: "Task deleted successfully." });
    } catch (error) {
        console.error("Error in delete-task route:", error);
        res.status(500).json({ 
            message: "Internal Server Error", 
            error: error.message,
            stack: error.stack
        });
    }
});


// Update a task
router.put("/update-task/:id", authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.headers.id;
        const { title, description, dueDate, assignedTo } = req.body;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.assignedBy.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to update this task" });
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, { title, description, dueDate, assignedTo }, { new: true });

        const creator = await User.findById(userId);

        if (task.assignedTo.toString() !== assignedTo) {
            // Task is being reassigned
            const oldAssignee = await User.findById(task.assignedTo);
            const newAssignee = await User.findById(assignedTo);

            // Update user-task relationships
            await User.findByIdAndUpdate(task.assignedTo, { $pull: { assignedTasks: taskId } });
            await User.findByIdAndUpdate(assignedTo, { $push: { assignedTasks: taskId } });

            // Send email to the old assignee
            if (oldAssignee && oldAssignee._id.toString() !== userId) {
                await sendEmail(
                    oldAssignee.email,
                    "Task Reassigned",
                    `Hello ${oldAssignee.username},\n\nA task previously assigned to you has been reassigned:\n\nTask ID: ${taskId}\nTitle: ${updatedTask.title}\nNew Assignee: ${newAssignee.username}\nDue Date: ${new Date(updatedTask.dueDate).toLocaleDateString()}\n\nPlease log in to your account for more information.`
                );
            }

            // Send email to the new assignee (including self-assignment)
            if (newAssignee) {
                await sendEmail(
                    newAssignee.email,
                    "New Task Assigned",
                    `Hello ${newAssignee.username},\n\nA new task has been ${newAssignee._id.toString() === userId ? 'self-assigned to you' : 'assigned to you'}:\n\nTask ID: ${taskId}\nTitle: ${updatedTask.title}\nAssigned By: ${creator.username}\nDue Date: ${new Date(updatedTask.dueDate).toLocaleDateString()}\n\nPlease log in to your account for more information and to view task details.`
                );
            }
        } else {
            // Task details updated, but not reassigned
            const assignedUser = await User.findById(assignedTo);
            if (assignedUser) {
                await sendEmail(
                    assignedUser.email,
                    "Task Updated",
                    `Hello ${assignedUser.username},\n\nA task assigned to you has been updated:\n\nTask ID: ${taskId}\nTitle: ${updatedTask.title}\nDue Date: ${new Date(updatedTask.dueDate).toLocaleDateString()}\n\nPlease log in to your account to view more details.`
                );
            }
        }

        res.status(200).json({ message: "Task updated successfully.", task: updatedTask });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


// Toggle task completion status
router.put("/update-complete-task/:id", authenticateToken, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.headers.id;

        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        if (task.assignedBy.toString() !== userId) {
            return res.status(403).json({ message: "You don't have permission to update this task" });
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, { complete: !task.complete }, { new: true });

        const assignedUser = await User.findById(task.assignedTo);
        if (assignedUser) {
            await sendEmail(
                assignedUser.email,
                "Task Completion Status Updated",
                `Hello ${assignedUser.username},\n\nThe completion status of a task has been updated:\n\nTask ID: ${taskId}\nTitle: ${task.title}\nNew Status: ${updatedTask.complete ? 'Complete' : 'Incomplete'}\n\nPlease log in to your account for more details.`
            );
        }

        res.status(200).json({ message: "Task completion status updated successfully.", task: updatedTask });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
});


// Get all completed tasks
router.get('/get-complete-tasks', authenticateToken, async (req, res) => {
    try {
        const userId = req.headers.id;

        // Fetch tasks where the user is either the creator or assignee, and tasks are completed
        const user = await User.findById(userId).populate({
            path: 'createdTasks assignedTasks',
            match: { complete: true }
        });

        // Combine both created and assigned tasks
        const allTasks = [...user.createdTasks, ...user.assignedTasks];

        res.status(200).json({ data: allTasks });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Internal Server Error' });
    }
});


// Get all incomplete tasks
router.get('/get-incomplete-tasks', authenticateToken, async (req, res) => {
    try {
        const userId = req.headers.id;

        // Find all tasks where the user is either the creator or the assignee and the task is incomplete
        const tasks = await Task.find({
            $and: [
                { complete: false },
                { $or: [{ assignedBy: userId }, { assignedTo: userId }] }
            ]
        });

        res.status(200).json({ data: tasks });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

module.exports = router;