import { useState } from 'react'
import { Button } from './Button'
import { Checkbox } from './Checkbox'
import { Combobox } from './Combobox'
import { Dialog } from './Dialog'
import { Drawer } from './Drawer'
import { Input } from './Input'
import { RadioGroup } from './RadioGroup'
import { Slider } from './Slider'
import { Textarea } from './Textarea'

const PLANK_OPTIONS = [
  { value: 'chene-120', label: 'Chêne 120 cm' },
  { value: 'chene-90',  label: 'Chêne 90 cm' },
  { value: 'pin-150',   label: 'Pin 150 cm' },
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{
        fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase',
        letterSpacing: '.06em', color: 'var(--text-muted)',
        paddingBottom: 8, borderBottom: 'var(--border)',
      }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>{children}</div>
}

export function Demo() {
  const [theme,       setTheme]       = useState<'light' | 'dark'>('light')
  const [combo,       setCombo]       = useState('chene-120')
  const [checked,     setChecked]     = useState(false)
  const [opacity,     setOpacity]     = useState(60)
  const [rotation,    setRotation]    = useState('0')
  const [dialogOpen,  setDialogOpen]  = useState(false)
  const [dialog2Open, setDialog2Open] = useState(false)
  const [drawerOpen,  setDrawerOpen]  = useState(false)

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.dataset.theme = next
  }

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      color: 'var(--text)',
      fontFamily: 'var(--font-sans)',
      padding: 32,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-md)', fontWeight: 700, color: 'var(--text)' }}>
            Design system — Calepinage
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: 2 }}>
            Composants atomiques · <strong style={{ color: 'var(--accent)' }}>Bordeaux vin</strong>
          </p>
        </div>
        <Button variant="secondary" onClick={toggleTheme}>
          {theme === 'light' ? '🌙 Sombre' : '☀️ Clair'}
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 680 }}>

        {/* Palette */}
        <Section title="Palette">
          <Row>
            {[
              ['--accent',       'Accent'],
              ['--accent-light', 'Accent light'],
              ['--danger',       'Danger'],
              ['--danger-light', 'Danger light'],
              ['--warning',      'Warning'],
              ['--success',      'Success'],
              ['--bg',           'Bg'],
              ['--surface',      'Surface'],
              ['--text-muted',   'Text muted'],
            ].map(([token, label]) => (
              <div key={token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-sm)',
                  background: `var(${token})`, border: 'var(--border)',
                }} />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', textAlign: 'center' }}>
                  {label}
                </span>
              </div>
            ))}
          </Row>
        </Section>

        {/* Button */}
        <Section title="Button">
          <Row>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </Row>
          <Row>
            <Button variant="primary" size="sm">Primary sm</Button>
            <Button variant="secondary" size="sm">Secondary sm</Button>
            <Button variant="ghost" size="sm">Ghost sm</Button>
          </Row>
          <Row>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="secondary" disabled>Disabled</Button>
            <Button variant="primary" iconOnly>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </Button>
          </Row>
        </Section>

        {/* Input */}
        <Section title="Input">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Input label="Longueur (cm)" type="number" placeholder="120" />
            <Input label="Largeur (cm)" type="number" placeholder="14" />
            <Input label="Avec erreur" type="text" defaultValue="valeur invalide" error="Ce champ est requis" />
            <Input label="Désactivé" type="text" placeholder="—" disabled />
          </div>
        </Section>

        {/* Textarea */}
        <Section title="Textarea">
          <Textarea label="Description" placeholder="URL fournisseur, code référence, note…" />
          <Textarea label="Avec erreur" defaultValue="…" error="Description trop courte" />
        </Section>

        {/* Checkbox */}
        <Section title="Checkbox">
          <Row>
            <Checkbox label="Option activée" checked={checked} onChange={e => setChecked(e.target.checked)} />
            <Checkbox label="Non cochée" defaultChecked={false} onChange={() => {}} />
            <Checkbox label="Désactivée" disabled checked={false} onChange={() => {}} />
            <Checkbox label="Désactivée cochée" disabled checked onChange={() => {}} />
          </Row>
        </Section>

        {/* Combobox */}
        <Section title="Combobox">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Combobox label="Type de lame" options={PLANK_OPTIONS} value={combo} onChange={setCombo} />
            <Combobox label="Vidable" options={PLANK_OPTIONS} value={combo} onChange={setCombo} clearable />
            <Combobox label="Désactivé" options={PLANK_OPTIONS} value={combo} onChange={() => {}} disabled />
          </div>
        </Section>

        {/* Slider */}
        <Section title="Slider">
          <Slider label="Opacité" value={opacity} onChange={setOpacity} unit=" %" />
          <Slider label="Désactivé" value={40} onChange={() => {}} unit=" %" disabled />
        </Section>

        {/* RadioGroup */}
        <Section title="RadioGroup">
          <RadioGroup
            label="Rotation"
            options={[{ value: '0', label: '0°' }, { value: '90', label: '90°' }, { value: '180', label: '180°' }, { value: '270', label: '270°' }]}
            value={rotation}
            onChange={setRotation}
          />
          <RadioGroup
            label="Désactivé"
            options={[{ value: '0', label: '0°' }, { value: '90', label: '90°' }]}
            value="0"
            onChange={() => {}}
            disabled
          />
        </Section>

        {/* Dialog */}
        <Section title="Dialog">
          <Row>
            <Button variant="secondary" onClick={() => setDialogOpen(true)}>
              Confirmation simple
            </Button>
            <Button variant="danger" onClick={() => setDialog2Open(true)}>
              Suppression protégée
            </Button>
          </Row>
          <Dialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            title="Confirmer l'action"
            actions={
              <>
                <Button variant="ghost" onClick={() => setDialogOpen(false)}>Annuler</Button>
                <Button variant="primary" onClick={() => setDialogOpen(false)}>Confirmer</Button>
              </>
            }
          >
            Cette action va modifier les données du projet. Souhaitez-vous continuer ?
          </Dialog>
          <Dialog
            open={dialog2Open}
            onClose={() => setDialog2Open(false)}
            title="Supprimer le projet ?"
            actions={
              <>
                <Button variant="ghost" onClick={() => setDialog2Open(false)}>Annuler</Button>
                <Button variant="danger" style={{ background: 'var(--danger)', color: '#fff', borderColor: 'var(--danger)' }} onClick={() => setDialog2Open(false)}>
                  Supprimer
                </Button>
              </>
            }
          >
            Le projet <strong>Appartement</strong> contient 3 pièces et 12 rangées. Cette suppression est irréversible.
          </Dialog>
        </Section>

        {/* Drawer */}
        <Section title="Drawer">
          <Row>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              Ouvrir le drawer
            </Button>
          </Row>
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Tableaux">
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Contenu du drawer — résumé des achats, chutes réutilisables, export CSV.
            </p>
          </Drawer>
        </Section>

        {/* Tokens typographie */}
        <Section title="Typographie">
          {([
            ['var(--text-xs)', '11px — labels secondaires'],
            ['var(--text-sm)', '12px — labels, métadonnées'],
            ['var(--text-base)', '13px — texte courant'],
            ['var(--text-md)', '15px — titres de section'],
          ] as const).map(([size, label]) => (
            <div key={size} style={{ fontSize: size, color: 'var(--text)' }}>{label}</div>
          ))}
        </Section>

      </div>
    </div>
  )
}
