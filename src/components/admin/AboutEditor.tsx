"use client"

import { useState } from "react"
import type { AboutBlock, AboutContent } from "@/lib/site-content"
import { emptyLocalizedText } from "@/lib/i18n-field"
import type { Language } from "@/lib/translations"
import {
  FallbackHint,
  Field,
  ListControls,
  LocaleSwitcher,
  Panel,
  SaveBar,
  buttonClass,
  inputClass,
  missingLocales,
  moveItem,
  useContentEditor,
} from "@/components/admin/admin-ui"

const MAX_BLOCKS_PER_SCREEN = 3

function emptyBlock(): AboutBlock {
  return { title: emptyLocalizedText(), body: emptyLocalizedText() }
}

export function AboutEditor({ about }: { about: AboutContent }) {
  const [locale, setLocale] = useState<Language>("es")
  const { value, update, save, status, dirty } = useContentEditor("about", about)
  const L = locale.toUpperCase()

  const setScreens = (screens: AboutContent["screens"]) => update((prev) => ({ ...prev, screens }))

  const setBlocks = (screenIndex: number, blocks: AboutBlock[]) =>
    setScreens(value.screens.map((screen, i) => (i === screenIndex ? { blocks } : screen)))

  const setBlockText = (screenIndex: number, blockIndex: number, field: keyof AboutBlock, text: string) =>
    setBlocks(
      screenIndex,
      value.screens[screenIndex].blocks.map((block, i) =>
        i === blockIndex ? { ...block, [field]: { ...block[field], [locale]: text } } : block
      )
    )

  const allFields = [
    value.title,
    ...value.screens.flatMap((screen) => screen.blocks.flatMap((block) => [block.title, block.body])),
  ]

  return (
    <div className="space-y-6">
      <LocaleSwitcher locale={locale} onChange={setLocale} missing={missingLocales(allFields)} />

      <Panel title="Título de la sección">
        <Field label={`Título (${L})`} hint={<FallbackHint locale={locale} />}>
          <input
            type="text"
            value={value.title[locale] ?? ""}
            onChange={(e) => update((prev) => ({ ...prev, title: { ...prev.title, [locale]: e.target.value } }))}
            className={`${inputClass} font-serif text-xl italic`}
          />
        </Field>
      </Panel>

      {value.screens.map((screen, screenIndex) => (
        <Panel
          key={screenIndex}
          title={`Pantalla ${screenIndex + 1}`}
          description={
            screen.blocks.length > 2
              ? "Más de dos bloques en una pantalla puede quedar largo en celulares."
              : undefined
          }
          actions={
            <ListControls
              label={`pantalla ${screenIndex + 1}`}
              onUp={() => setScreens(moveItem(value.screens, screenIndex, -1))}
              onDown={() => setScreens(moveItem(value.screens, screenIndex, 1))}
              onRemove={() => {
                if (confirm(`¿Eliminar la pantalla ${screenIndex + 1} y sus textos en todos los idiomas?`)) {
                  setScreens(value.screens.filter((_, i) => i !== screenIndex))
                }
              }}
              disableUp={screenIndex === 0}
              disableDown={screenIndex === value.screens.length - 1}
            />
          }
        >
          {screen.blocks.map((block, blockIndex) => (
            <div key={blockIndex} className="border border-neutral-200 p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs uppercase tracking-wider text-neutral-400">Bloque {blockIndex + 1}</span>
                <ListControls
                  label={`bloque ${blockIndex + 1}`}
                  onUp={() => setBlocks(screenIndex, moveItem(screen.blocks, blockIndex, -1))}
                  onDown={() => setBlocks(screenIndex, moveItem(screen.blocks, blockIndex, 1))}
                  onRemove={() => setBlocks(screenIndex, screen.blocks.filter((_, i) => i !== blockIndex))}
                  disableUp={blockIndex === 0}
                  disableDown={blockIndex === screen.blocks.length - 1}
                />
              </div>
              <div className="space-y-4">
                <Field label={`Subtítulo (${L})`} hint="Aparece grande, en serif itálica. Opcional.">
                  <input
                    type="text"
                    value={block.title[locale] ?? ""}
                    onChange={(e) => setBlockText(screenIndex, blockIndex, "title", e.target.value)}
                    placeholder="La práctica"
                    className={`${inputClass} font-serif text-lg italic`}
                  />
                </Field>
                <Field
                  label={`Texto (${L})`}
                  hint="Deja una línea en blanco entre párrafos para separarlos."
                >
                  <textarea
                    value={block.body[locale] ?? ""}
                    onChange={(e) => setBlockText(screenIndex, blockIndex, "body", e.target.value)}
                    rows={7}
                    className={`${inputClass} text-sm leading-relaxed`}
                  />
                </Field>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setBlocks(screenIndex, [...screen.blocks, emptyBlock()])}
            disabled={screen.blocks.length >= MAX_BLOCKS_PER_SCREEN}
            className={buttonClass}
          >
            + Bloque en esta pantalla
          </button>
        </Panel>
      ))}

      <button
        type="button"
        onClick={() => setScreens([...value.screens, { blocks: [emptyBlock()] }])}
        className={`${buttonClass} w-full justify-center border-dashed py-4`}
      >
        + Nueva pantalla
      </button>

      <SaveBar status={status} dirty={dirty} onSave={save} previewHref="/#about" />
    </div>
  )
}
