export const mockInquiries = [
  {
    id: "inq_001",
    buyer: {
      name: "Acme Corp Logistics",
      initials: "AC",
      company: "Acme Corp",
    },
    product: {
      name: "Industrial High-Grade Steel Valves",
      image: "/placeholder_valve.jpg",
    },
    status: "new", // new, replied, converted
    lastMessage:
      "Hi, I'm interested in Industrial High-Grade Steel Valves. Could you please provide clearer pricing for 500 pcs?",
    timestamp: "10:30 AM",
    unreadCount: 1,
    messages: [
      {
        id: "m1",
        sender: "buyer",
        text: "Hi, I'm interested in Industrial High-Grade Steel Valves. Could you please provide clearer pricing for 500 pcs?",
        timestamp: "10:30 AM",
        attachments: [],
      },
    ],
  },
  {
    id: "inq_002",
    buyer: {
      name: "BuildRight Construction",
      initials: "BC",
      company: "BuildRight",
    },
    product: {
      name: "Heavy Duty Excavator Parts (Set of 4)",
      image: "/placeholder_excavator.jpg",
    },
    status: "replied",
    lastMessage: "Sure, we can send the samples by Friday.",
    timestamp: "Yesterday",
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        sender: "buyer",
        text: "Do you have these in stock for immediate shipment?",
        timestamp: "Yesterday 2:00 PM",
        attachments: [],
      },
      {
        id: "m2",
        sender: "seller",
        text: "Yes, we have about 50 sets ready to ship.",
        timestamp: "Yesterday 2:15 PM",
        attachments: [],
      },
      {
        id: "m3",
        sender: "buyer",
        text: "Great. Can you send a sample invoice?",
        timestamp: "Yesterday 2:30 PM",
        attachments: [],
      },
      {
        id: "m4",
        sender: "seller",
        text: "Sure, we can send the samples by Friday.",
        timestamp: "Yesterday 2:45 PM",
        attachments: [],
      },
    ],
  },
  {
    id: "inq_003",
    buyer: {
      name: "Global Trade Partners",
      initials: "GT",
      company: "Global Trade",
    },
    product: {
      name: "Solar Panel Mounting Kits 500W",
      image: "/placeholder_solar.jpg",
    },
    status: "converted",
    lastMessage: "Order placed. Thanks for the quotation.",
    timestamp: "Mon",
    unreadCount: 0,
    messages: [
      {
        id: "m1",
        sender: "buyer",
        text: "Looking for 1000 units. What is your best FOB price?",
        timestamp: "Mon 9:00 AM",
        attachments: [{ name: "specs_req.pdf", size: "1.2MB" }],
      },
      {
        id: "m2",
        sender: "seller",
        text: "I have sent you a formal quotation.",
        timestamp: "Mon 11:00 AM",
        isQuotation: true,
        attachments: [],
      },
      {
        id: "m3",
        sender: "buyer",
        text: "Order placed. Thanks for the quotation.",
        timestamp: "Mon 1:00 PM",
        attachments: [],
      },
    ],
  },
];
