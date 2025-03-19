const Notification = require("../model/notification"); // Adjust path as needed
const RabbitMQService = require("../config/rabbitmq");


exports.getnotifications = async (req, res) => {
  console.log("hj")
  try {
    const { userId, read  } = req.params;
    console.log("userId:", userId, "read param:", read);
     
    const notify = await Notification.find({
      userId,
      read: read,
    }).sort({ sentAt: -1 });

    if (notify.length > 0) {
      const notificationIds = notify.map(
        (notification) => notification._id
      );

      if(read){
        console.log("in notify update")
        await Notification.updateMany(
          {
            _id: { $in: notificationIds },
          },
          { read: true },

        );
      }
     
    }
    res.status(200).json({
      count: notify.length,
      data: notify,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching unread notifications",
      error: error.message,
    });
  }
};


exports.create_notification = async (content, userId, type) => {
  try {
    if (!userId) {
      return { success: false, message: "User ID is required" };
    }

    if (!["promotion", "order_update", "recommendation"].includes(type)) {
      return { success: false, message: "Invalid notification type" };
    }

    if (typeof content !== "string" || content.length <= 5) {
      return { success: false, message: "Content length must be greater than 5 characters" };
    }

    const existingNotification = await Notification.findOne({ userId, type, content });
    if (existingNotification) {
      console.log("Duplicate notification already exists");
      
      return {message: "Duplicate notification already exists" };
    }


   await Notification.create({ userId, type, content });

    
    return { success: true };
  } catch (error) {
    console.error("Error creating notification:", error);
    return { success: false, message: "Internal server error" };
  }
};
