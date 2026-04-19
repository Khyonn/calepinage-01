import { useState, Fragment } from "react";
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
  const entries = NAV_ENTRIES;

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
          {entries.map((e) => (
            <div key={e.label} className={styles.row}>
              <span className={styles.label}>{e.label}</span>
              <span className={styles.combos}>
                {e.combos.map((c, i) => (
                  <Combo key={i} text={c} />
                ))}
              </span>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
