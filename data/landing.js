import {
  BarChart3,
  Receipt,
  PieChart,
  CreditCard,
  Globe,
  Zap,
} from "lucide-react";

// Stats Data
export const statsData = [
  {
    value: "5K+",
    label: "Active Users",
  },
  {
    value: "₹2Lakh+",
    label: "Transactions Tracked",
  },
  {
    value: "99.9%",
    label: "Uptime",
  },
  {
    value: "4.8/5",
    label: "User Rating",
  },
];

// Features Data
export const featuresData = [
  {
    icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
    title: "Advanced Analytics",
    description:
      "Gain detailed insights into spending patterns through AI-powered financial analysis.",
  },
  {
    icon: <Receipt className="w-8 h-8 text-blue-600" />,
    title: "Smart Receipt Scanner",
    description:
      "Automatically extract and organize receipt data using AI for accurate financial records.",
  },
  {
    icon: <PieChart className="w-8 h-8 text-blue-600" />,
    title: "Budget Planning",
    description:
      "Create, manage, and optimize budgets with AI-driven recommendations.",
  },
  {
    icon: <CreditCard className="w-8 h-8 text-blue-600" />,
    title: "Multi-Account Support",
    description:
      "Manage multiple bank accounts and credit cards from a single, unified dashboard.",
  },
  {
    icon: <Globe className="w-8 h-8 text-blue-600" />,
    title: "Indian Currency (INR)",
    description:
      "Track all amounts in Indian Rupees (₹) with Indian number formatting.",
  },
  {
    icon: <Zap className="w-8 h-8 text-blue-600" />,
    title: "Automated Insights",
    description:
      "Receive automated financial insights and intelligent recommendations.",
  },
];

// How It Works Data
export const howItWorksData = [
  {
    icon: <CreditCard className="w-8 h-8 text-blue-600" />,
    title: "1. Create Your Account",
    description:
      "Get started in minutes with our simple and secure sign-up process",
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-blue-600" />,
    title: "2. Track Your Spending",
    description:
      "Automatically categorize and track your transactions in real-time",
  },
  {
    icon: <PieChart className="w-8 h-8 text-blue-600" />,
    title: "3. Get Insights",
    description:
      "Receive AI-powered insights and recommendations to optimize your finances",
  },
];

// Testimonials Data
export const testimonialsData = [
  {
    name: "Swami Prasad",
    role: "Small Business Owner",
    image: "/Rudra-Raj-Kiran .jpg",
    quote:
      "wealthIQ has transformed the way I manage my business finances. Its AI-driven insights helped me uncover cost-saving opportunities I had never identified before.",
  },
  {
    name: "Srivasthava varma",
    role: "Freelancer",
    image: "/varma.jpg",
    quote:
      "The smart receipt scanning feature saves me hours every month. I can now focus on my work instead of spending time on manual data entry and expense tracking.",
  },
  {
    name: "Rishabh Chaudhary",
    role: "Financial Advisor",
    image: "/rishabh.jpg",
    quote:
      "I recommend welthIQ to my clients. The multi-currency support and detailed analytics make it an excellent platform for managing international investments.",
  },
];
