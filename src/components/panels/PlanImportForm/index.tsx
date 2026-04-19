import { useState, type DragEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { Slider } from '@/components/ui/Slider'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { CalibrationForm } from '@/components/panels/CalibrationForm'
import { useObjectURL } from '@/components/canvas/BackgroundPlan/useObjectURL'
import { useImageDimensions } from '@/components/canvas/BackgroundPlan/useImageDimensions'
import { useAppDispatch, useAppSelector } from '@/hooks/redux'
import { selectBackgroundPlan } from '@/store/selectors'
import { projectActions } from '@/store/projectSlice'
import { useCalibrationContext } from './CalibrationContext'
import { useImagePicker } from './useImagePicker'
import styles from './PlanImportForm.module.css'

const ROTATION_OPTIONS = [
  { value: '0',   label: '0°' },
  { value: '90',  label: '90°' },
  { value: '180', label: '180°' },
  { value: '270', label: '270°' },
]

export function PlanImportForm() {
  const plan = useAppSelector(selectBackgroundPlan)
  const dispatch = useAppDispatch()
  const picker = useImagePicker()
  const calib = useCalibrationContext()
  const [dragOver, setDragOver] = useState(false)

  const url = useObjectURL(plan?.imageFile)
  const dims = useImageDimensions(url)

  const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) picker.handleDropFile(file)
  }

  const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const startCalibration = () => {
    if (!dims || !calib) return
    if (plan?.calibration) {
      calib.start(plan.calibration.point1, plan.calibration.point2, plan.calibration.realDistance)
    } else {
      calib.start(
        { x: dims.naturalWidth / 2 - 50, y: dims.naturalHeight / 2 },
        { x: dims.naturalWidth / 2 + 50, y: dims.naturalHeight / 2 },
        null,
      )
    }
  }

  return (
    <div className={styles.form}>
      <section className={styles.section} aria-label="Import plan">
        <h3 className={styles.title}>Image de fond</h3>
        {!plan?.imageFile ? (
          <button
            type="button"
            className={[styles.drop, dragOver && styles.dropOver].filter(Boolean).join(' ')}
            onClick={picker.openPicker}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <span className={styles.dropPrimary}>Importer une image</span>
            <span className={styles.dropSecondary}>ou glissez-la ici</span>
          </button>
        ) : (
          <div className={styles.fileInfo}>
            <span className={styles.fileName}>{plan.imageFile.name}</span>
            <Button size="sm" variant="danger" onClick={() => dispatch(projectActions.removePlan())}>
              Supprimer
            </Button>
          </div>
        )}
        <input
          ref={picker.inputRef}
          type="file"
          accept={picker.acceptAttr}
          onChange={picker.handleInputChange}
          className={styles.hiddenInput}
        />
      </section>

      {plan?.imageFile && (
        <>
          <section className={styles.section} aria-label="Opacité">
            <Slider
              label="Opacité"
              unit=" %"
              min={0}
              max={100}
              step={5}
              value={Math.round(plan.opacity * 100)}
              onChange={v => dispatch(projectActions.updatePlan({ opacity: v / 100 }))}
            />
          </section>

          <section className={styles.section} aria-label="Rotation">
            <h3 className={styles.title}>Rotation</h3>
            <RadioGroup
              options={ROTATION_OPTIONS}
              value={String(plan.rotation)}
              onChange={v => dispatch(projectActions.updatePlan({ rotation: Number(v) as 0 | 90 | 180 | 270 }))}
            />
          </section>

          <section className={styles.section} aria-label="Calibration">
            <h3 className={styles.title}>Calibration</h3>
            {!calib?.active ? (
              <Button variant="secondary" onClick={startCalibration} disabled={!dims} className={styles.calibrateBtn}>
                {plan.calibration ? 'Recalibrer' : 'Calibrer'}
              </Button>
            ) : (
              <CalibrationForm
                initialDistance={calib.initialDistance}
                onCancel={calib.cancel}
                onValidate={calib.validate}
              />
            )}
          </section>
        </>
      )}
    </div>
  )
}
