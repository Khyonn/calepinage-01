import { useState, Fragment } from "react";
import { useAppSelector } from "@/hooks/redux";
import { selectInteractionMode } from "@/store/selectors";
import styles from "./HelperPanel.module.css";

interface Entry {
  label: string;
  combos: string[];
}

const NAV_ENTRIES: Entry[] = [
  {
    label: "Déplacer la vue",
    combos: ["Espace + Grab G.", "Grab Mol."],
  },
  { label: "Zoomer", combos: ["Ctrl + Mol."] },
  { label: "Défiler horizontal", combos: ["Shift + Mol."] },
  { label: "Défiler vertical", combos: ["Molette"] },
];

const PLAN_ENTRIES: Entry[] = [
  { label: "Déplacer le plan", combos: ["Grab G."] },
];

const DRAW_ENTRIES: Entry[] = [
  { label: "Poser un sommet", combos: ["Clic G."] },
  { label: "Aligner (X, Y)", combos: ["Ctrl + Move"] },
  { label: "Valider la pièce", combos: ["Entrée"] },
  { label: "Retirer dernier sommet", combos: ["Suppr"] },
  { label: "Annuler le tracé", combos: ["Échap"] },
];

function Combo({ text }: { text: string }) {
  const tokens = text.split(/\s*\+\s*/);
  return (
    <span className={styles.combo}>
      {tokens.map((t, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span className={styles.plus} aria-hidden>
              +
            </span>
          )}
          <kbd className={styles.kbd}>{t}</kbd>
        </Fragment>
      ))}
    </span>
  );
}

export function HelperPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const mode = useAppSelector(selectInteractionMode);
  const modeEntries: Entry[] =
    mode === "plan" ? PLAN_ENTRIES :
    mode === "draw" ? DRAW_ENTRIES :
    [];

  const renderRow = (e: Entry) => (
    <div key={e.label} className={styles.row}>
      <span className={styles.label}>{e.label}</span>
      <span className={styles.combos}>
        {e.combos.map((c, i) => (
          <Combo key={i} text={c} />
        ))}
      </span>
    </div>
  );

  return (
    <aside className={styles.panel}>
      <button
        type="button"
        className={[styles.header, !collapsed && styles.open]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
      >
        <span>Raccourcis</span>
        <span aria-hidden>{collapsed ? "▸" : "▾"}</span>
      </button>
      {!collapsed && (
        <div className={styles.body}>
          {modeEntries.map(renderRow)}
          {modeEntries.length > 0 && <hr className={styles.separator} />}
          {NAV_ENTRIES.map(renderRow)}
        </div>
      )}
    </aside>
  );
}
