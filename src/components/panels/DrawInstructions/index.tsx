import styles from './DrawInstructions.module.css'

export function DrawInstructions() {
  return (
    <div className={styles.wrap}>
      <p className={styles.lead}>
        Cliquez sur le canvas pour poser les sommets de la pièce. Reportez-vous au panneau « Raccourcis » pour les commandes disponibles.
      </p>
    </div>
  )
}
