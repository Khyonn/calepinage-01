import { useState } from 'react'
import { Dialog } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { RadioGroup } from '@/components/ui/RadioGroup'
import { Textarea } from '@/components/ui/Textarea'
import { useAppDispatch } from '@/hooks/redux'
import { projectActions } from '@/store/projectSlice'
import type { PlankType, PlankTypePricing } from '@/core/types'
import styles from './PlankTypeForm.module.css'

interface Props {
  initial: PlankType | null
  locked: boolean
  onClose: () => void
}

type PricingType = 'unit' | 'lot'

const parseNum = (s: string): number => {
  const n = parseFloat(s.replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

export function PlankTypeForm({ initial, locked, onClose }: Props) {
  const initPricingType: PricingType = initial?.pricing.type ?? 'unit'
  const initPriceUnit =
    initial?.pricing.type === 'unit' ? String(initial.pricing.pricePerUnit) : '0'
  const initPriceLot =
    initial?.pricing.type === 'lot' ? String(initial.pricing.pricePerLot) : '0'
  const initLotSize =
    initial?.pricing.type === 'lot' ? String(initial.pricing.lotSize) : '1'

  const [name, setName] = useState(initial?.name ?? '')
  const [length, setLength] = useState(String(initial?.length ?? 120))
  const [width, setWidth] = useState(String(initial?.width ?? 14))
  const [pricingType, setPricingType] = useState<PricingType>(initPricingType)
  const [priceUnit, setPriceUnit] = useState(initPriceUnit)
  const [priceLot, setPriceLot] = useState(initPriceLot)
  const [lotSize, setLotSize] = useState(initLotSize)
  const [description, setDescription] = useState(initial?.description ?? '')
  const dispatch = useAppDispatch()

  const isEdit = initial !== null
  const lengthN = parseNum(length)
  const widthN = parseNum(width)
  const valid =
    name.trim().length > 0 &&
    lengthN > 0 &&
    widthN > 0 &&
    (pricingType === 'unit'
      ? parseNum(priceUnit) >= 0
      : parseNum(priceLot) >= 0 && parseNum(lotSize) >= 1)

  const buildPricing = (): PlankTypePricing =>
    pricingType === 'unit'
      ? { type: 'unit', pricePerUnit: parseNum(priceUnit) }
      : { type: 'lot', pricePerLot: parseNum(priceLot), lotSize: parseNum(lotSize) }

  const submit = () => {
    if (!valid) return
    const payload = {
      name: name.trim(),
      length: lengthN,
      width: widthN,
      pricing: buildPricing(),
      description,
    }
    if (isEdit) {
      dispatch(projectActions.updatePlankType({
        id: initial.id, projectId: initial.projectId, ...payload,
      }))
    } else {
      dispatch(projectActions.addPlankType(payload))
    }
    onClose()
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={isEdit ? 'Modifier le type de lame' : 'Ajouter un type de lame'}
      actions={
        <>
          <Button variant="ghost" onClick={onClose}>Annuler</Button>
          <Button variant="primary" onClick={submit} disabled={!valid}>
            {isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </>
      }
    >
      <div
        className={styles.fields}
        onKeyDown={e => {
          if (e.key !== 'Enter' || e.shiftKey) return
          if ((e.target as HTMLElement).tagName === 'TEXTAREA') return
          e.preventDefault()
          submit()
        }}
      >
      <Input label="Nom" value={name} onChange={e => setName(e.currentTarget.value)} autoFocus />
      <Input
        label="Longueur (cm)" type="number" min={1} step="0.1" inputMode="decimal"
        value={length}
        readOnly={locked}
        onChange={e => setLength(e.currentTarget.value)}
      />
      <Input
        label="Largeur (cm)" type="number" min={1} step="0.1" inputMode="decimal"
        value={width}
        readOnly={locked}
        onChange={e => setWidth(e.currentTarget.value)}
      />
      <RadioGroup
        label="Tarif"
        value={pricingType}
        onChange={t => setPricingType(t as PricingType)}
        options={[
          { value: 'unit', label: 'À la lame' },
          { value: 'lot',  label: 'Au lot' },
        ]}
      />
      {pricingType === 'unit' ? (
        <Input
          label="Prix par lame (€)" type="number" min={0} step="0.01" inputMode="decimal"
          value={priceUnit}
          onChange={e => setPriceUnit(e.currentTarget.value)}
        />
      ) : (
        <div className={styles.row}>
          <Input
            label="Prix du lot (€)" type="number" min={0} step="0.01" inputMode="decimal"
            value={priceLot}
            onChange={e => setPriceLot(e.currentTarget.value)}
          />
          <Input
            label="Taille du lot" type="number" min={1} step={1} inputMode="numeric"
            value={lotSize}
            onChange={e => setLotSize(e.currentTarget.value)}
          />
        </div>
      )}
      <Textarea
        label="Description"
        value={description}
        onChange={e => setDescription(e.currentTarget.value)}
        rows={3}
      />
      </div>
    </Dialog>
  )
}
