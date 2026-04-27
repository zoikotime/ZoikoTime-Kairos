import {
  HiArrowTrendingUp,
  HiChatBubbleLeftRight,
  HiClipboardDocumentList,
  HiCog6Tooth,
  HiMiniArrowLongRight,
  HiMiniBolt,
  HiMiniLifebuoy,
  HiOutlineBuildingOffice2,
  HiPresentationChartBar,
  HiShieldCheck,
} from "react-icons/hi2";

export const quickActions = [
  { label: "Pricing", icon: HiArrowTrendingUp },
  { label: "Reports", icon: HiPresentationChartBar },
  { label: "Screenshots", icon: HiClipboardDocumentList },
  { label: "Employee View", icon: HiChatBubbleLeftRight },
  { label: "Admin Setup", icon: HiMiniBolt },
  { label: "Policies", icon: HiShieldCheck },
  { label: "Support", icon: HiMiniLifebuoy },
];

export const statusItems = ["ZoikoTime AI", "Role-aware", "Grounded answers", "Session: 0m"];

export const assistantProfile = {
  name: "Kairos",
  badge: "ZoikoTime Assistant",
  liveStatus: "Live • Website support active",
  summary: "ZoikoTime conversational assistant for pricing, setup guidance, policy explanation, employee transparency, and support routing.",
};

export const welcomeMessage = {
  title:
    "Hey there! Welcome to ZoikoTime. I'm Kairos, your ZoikoTime assistant. I can help visitors understand pricing and plans, guide admins through setup and reports, explain screenshot and transparency behavior, and route support questions to the right place.",
  prompt: "What can I help you with today?",
};

export const featuredCard = {
  title: "Browse ZoikoTime capabilities",
  subtitle: "Pricing, reports, policy guidance, employee transparency",
  icon: HiShieldCheck,
  actionIcon: HiMiniArrowLongRight,
};

export const solutionCards = [
  {
    title: "Pricing and plans",
    subtitle: "Subscriptions, plan comparison, and buying guidance",
    icon: HiArrowTrendingUp,
  },
  {
    title: "Check screenshot policy",
    subtitle: "Visibility rules, frequency, and workspace controls",
    icon: HiClipboardDocumentList,
  },
  {
    title: "Admin workspace setup",
    subtitle: "Configuration, onboarding, permissions, and rollout help",
    icon: HiCog6Tooth,
  },
  {
    title: "Employee transparency",
    subtitle: "What employees can see and how own-data access works",
    icon: HiChatBubbleLeftRight,
  },
  {
    title: "Support and troubleshooting",
    subtitle: "Issues, escalations, and guided next steps",
    icon: HiMiniLifebuoy,
  },
  {
    title: "For teams and businesses",
    subtitle: "Operational visibility, reporting, and accountability",
    icon: HiOutlineBuildingOffice2,
  },
];

export const responseActions = ["Listen", "Copy", "Helpful", "Escalate"];

export const suggestionChips = ["Show pricing options", "Explain screenshots", "Admin setup help"];
