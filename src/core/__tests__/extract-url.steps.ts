import { expect } from 'vitest'
import { describeFeature, loadFeature } from '@amiceli/vitest-cucumber'
import { extractFirstUrl } from '@/core/utils/url'

const feature = await loadFeature('src/core/__tests__/extract-url.feature', { language: 'fr' })

describeFeature(feature, ({ Scenario }) => {
  let text = ''
  let result: string | null = null

  Scenario('URL simple', ({ Given, When, Then }) => {
    Given('le texte "Voir https://example.com"', () => { text = 'Voir https://example.com' })
    When("j'extrais la première URL", () => { result = extractFirstUrl(text) })
    Then('le résultat est "https://example.com"', () => {
      expect(result).toBe('https://example.com')
    })
  })

  Scenario('URL en milieu de phrase', ({ Given, When, Then }) => {
    Given('le texte "Produit: https://example.com/produit disponible"', () => {
      text = 'Produit: https://example.com/produit disponible'
    })
    When("j'extrais la première URL", () => { result = extractFirstUrl(text) })
    Then('le résultat est "https://example.com/produit"', () => {
      expect(result).toBe('https://example.com/produit')
    })
  })

  Scenario('Pas d\'URL', ({ Given, When, Then }) => {
    Given('le texte "Aucune URL ici"', () => { text = 'Aucune URL ici' })
    When("j'extrais la première URL", () => { result = extractFirstUrl(text) })
    Then('le résultat est null', () => {
      expect(result).toBeNull()
    })
  })

  Scenario('Plusieurs URLs — première retournée', ({ Given, When, Then }) => {
    Given('le texte "https://first.com et https://second.com"', () => {
      text = 'https://first.com et https://second.com'
    })
    When("j'extrais la première URL", () => { result = extractFirstUrl(text) })
    Then('le résultat est "https://first.com"', () => {
      expect(result).toBe('https://first.com')
    })
  })

  Scenario('URL avec parenthèse fermante exclue', ({ Given, When, Then }) => {
    Given('le texte "(https://example.com)"', () => { text = '(https://example.com)' })
    When("j'extrais la première URL", () => { result = extractFirstUrl(text) })
    Then('le résultat est "https://example.com"', () => {
      expect(result).toBe('https://example.com')
    })
  })
})
