import type { AppDispatch, AppState } from '@/store/types'
import type { Project } from '@/core/types'
import { projectActions } from '@/store/projectSlice'
import { disambiguateName, type SerializedImage } from '@/core/projectSerialize'
import type { LastProjectIdStore } from '@/persistence/lastProjectId'

/**
 * Create a new project from an imported (already id-remapped) Project and
 * optional image. Handles name collision by appending " (importé)".
 * Persists via the existing idbMiddleware (no direct IDB write).
 */
export const importProjectThunk = (
  project: Project,
  image: SerializedImage | undefined,
  lastStore: LastProjectIdStore,
) =>
  async (dispatch: AppDispatch, getState: () => AppState) => {
    const existingNames = getState().project.list.map(p => p.name)
    const resolvedName = disambiguateName(project.name, existingNames)

    let hydrated: Project = resolvedName !== project.name
      ? { ...project, name: resolvedName }
      : project

    if (image && hydrated.backgroundPlan) {
      const file = await dataUrlToFile(image.dataUrl, image.name, image.mimeType)
      hydrated = {
        ...hydrated,
        backgroundPlan: { ...hydrated.backgroundPlan, imageFile: file },
      }
    }

    dispatch(projectActions.open(hydrated))
    lastStore.write(hydrated.id)
  }

async function dataUrlToFile(dataUrl: string, name: string, mimeType: string): Promise<File> {
  const res = await fetch(dataUrl)
  const blob = await res.blob()
  return new File([blob], name, { type: mimeType })
}
