import { useStore } from "../store/useStore";
import { uiText } from "../data/translations";

export default function EscalateButton() {
  const language = useStore((state) => state.language);
  const copy = uiText[language] || uiText.en;

  return (
    <button className="ghost-button" type="button" disabled title="Coming in the next phase">
      {copy.humanHandoff}
    </button>
  );
}
