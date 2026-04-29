import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  MessageCircleQuestion,
  Building2,
  Mail,
  UserRound,
} from "lucide-react";
import { verifyUser } from "../services/api";
import { useStore } from "../store/useStore";

// ─── UI Text (i18n) ───────────────────────────────────────────────────────────
const uiText = {
  en: {
    onboardingTag: "Powered by ZoikoTime",
  },
  fr: {
    onboardingTag: "Propulsé par ZoikoTime",
  },
  es: {
    onboardingTag: "Desarrollado por ZoikoTime",
  },
  de: {
    onboardingTag: "Unterstützt von ZoikoTime",
  },
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setUserSession = useStore((state) => state.setUserSession);
  const onboardingDraft = useStore((state) => state.onboardingDraft);
  const saveOnboardingDraft = useStore((state) => state.saveOnboardingDraft);
  const language = useStore((state) => state.language);
  const copy = uiText[language] || uiText.en;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (onboardingDraft) {
      setFormData({
        name: onboardingDraft.name || "",
        email: onboardingDraft.email || "",
        company: onboardingDraft.company || "",
      });
    }
  }, [onboardingDraft]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => {
      const next = { ...current, [name]: value };
      saveOnboardingDraft(next);
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const response = await verifyUser(formData);
      await setUserSession(response);
      toast.success("Koiris session started");
      navigate("/chat");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Unable to start session",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <motion.div
        className="onboarding-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="brand-row">
          <div className="brand-mark">K</div>
          <div>
            <p className="eyebrow">{copy.onboardingTag}</p>
            <h1>Koiris</h1>
          </div>
        </div>

        <p className="lead">
          Start your secure session, then Koiris can help with attendance,
          screenshots, leave, payslips, privacy, settings, and technical
          troubleshooting inside ZoikoTime.
        </p>

        <div className="info-strip">
          <span>
            <ShieldCheck size={16} /> Session saved only for your device
          </span>
          <span>
            <MessageCircleQuestion size={16} /> Knowledge-grounded guidance
            enabled
          </span>
        </div>

        <form className="onboarding-form" onSubmit={handleSubmit}>
          <label>
            Full name
            <div className="input-shell">
              <UserRound size={16} />
              <input
                name="name"
                placeholder="Mike Williams"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <label>
            Work email
            <div className="input-shell">
              <Mail size={16} />
              <input
                type="email"
                name="email"
                placeholder="mike@zoikogroup.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <label>
            Company
            <div className="input-shell">
              <Building2 size={16} />
              <input
                name="company"
                placeholder="Your organisation"
                value={formData.company}
                onChange={handleChange}
                required
              />
            </div>
          </label>

          <button
            className="primary-button"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Starting..." : "Continue to chat"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}