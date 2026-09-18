"use client"

import { useState } from "react"
import type { FaqCategory, FaqContent, FaqItem } from "@/lib/site-content"
import { emptyLocalizedText, pickLocale } from "@/lib/i18n-field"
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

function emptyItem(): FaqItem {
  return { question: emptyLocalizedText(), answer: emptyLocalizedText() }
}

export function FaqEditor({ faq }: { faq: FaqContent }) {
  const [locale, setLocale] = useState<Language>("es")
  const [openCategory, setOpenCategory] = useState(0)
  const { value, update, save, status, dirty } = useContentEditor("faq", faq)
  const L = locale.toUpperCase()

  const setCategories = (categories: FaqCategory[]) => update((prev) => ({ ...prev, categories }))

  const setCategory = (index: number, patch: Partial<FaqCategory>) =>
    setCategories(value.categories.map((category, i) => (i === index ? { ...category, ...patch } : category)))

  const setItemText = (categoryIndex: number, itemIndex: number, field: keyof FaqItem, text: string) =>
    setCategory(categoryIndex, {
      items: value.categories[categoryIndex].items.map((item, i) =>
        i === itemIndex ? { ...item, [field]: { ...item[field], [locale]: text } } : item
      ),
    })

  const allFields = [
    value.title,
    ...value.categories.flatMap((category) => [
      category.name,
      ...category.items.flatMap((item) => [item.question, item.answer]),
    ]),
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

      {value.categories.map((category, categoryIndex) => {
        const isOpen = openCategory === categoryIndex
        return (
          <section key={categoryIndex} className="border border-neutral-200 bg-white">
            <div className="flex items-center gap-3 p-4 sm:px-6">
              <button
                type="button"
                onClick={() => setOpenCategory(isOpen ? -1 : categoryIndex)}
                aria-expanded={isOpen}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <span className={`text-neutral-400 transition-transform ${isOpen ? "rotate-90" : ""}`}>›</span>
                <span className="truncate font-medium text-neutral-900">
                  {pickLocale(category.name, locale) || `Categoría ${categoryIndex + 1}`}
                </span>
                <span className="shrink-0 text-xs text-neutral-400">{category.items.length} preguntas</span>
              </button>
              <ListControls
                label={`categoría ${categoryIndex + 1}`}
                onUp={() => {
                  setCategories(moveItem(value.categories, categoryIndex, -1))
                  if (isOpen) setOpenCategory(categoryIndex - 1)
                }}
                onDown={() => {
                  setCategories(moveItem(value.categories, categoryIndex, 1))
                  if (isOpen) setOpenCategory(categoryIndex + 1)
                }}
                onRemove={() => {
                  if (confirm("¿Eliminar esta categoría y todas sus preguntas en todos los idiomas?")) {
                    setCategories(value.categories.filter((_, i) => i !== categoryIndex))
                  }
                }}
                disableUp={categoryIndex === 0}
                disableDown={categoryIndex === value.categories.length - 1}
              />
            </div>

            {isOpen && (
              <div className="space-y-5 border-t border-neutral-200 p-4 sm:p-6">
                <Field label={`Nombre de la pestaña (${L})`}>
                  <input
                    type="text"
                    value={category.name[locale] ?? ""}
                    onChange={(e) => setCategory(categoryIndex, { name: { ...category.name, [locale]: e.target.value } })}
                    className={inputClass}
                  />
                </Field>

                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="border border-neutral-200 p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="text-xs uppercase tracking-wider text-neutral-400">Pregunta {itemIndex + 1}</span>
                      <ListControls
                        label={`pregunta ${itemIndex + 1}`}
                        onUp={() => setCategory(categoryIndex, { items: moveItem(category.items, itemIndex, -1) })}
                        onDown={() => setCategory(categoryIndex, { items: moveItem(category.items, itemIndex, 1) })}
                        onRemove={() =>
                          setCategory(categoryIndex, { items: category.items.filter((_, i) => i !== itemIndex) })
                        }
                        disableUp={itemIndex === 0}
                        disableDown={itemIndex === category.items.length - 1}
                      />
                    </div>
                    <div className="space-y-3">
                      <input
                        type="text"
                        aria-label={`Pregunta ${itemIndex + 1} (${L})`}
                        value={item.question[locale] ?? ""}
                        onChange={(e) => setItemText(categoryIndex, itemIndex, "question", e.target.value)}
                        placeholder="Pregunta"
                        className={`${inputClass} font-medium`}
                      />
                      <textarea
                        aria-label={`Respuesta ${itemIndex + 1} (${L})`}
                        value={item.answer[locale] ?? ""}
                        onChange={(e) => setItemText(categoryIndex, itemIndex, "answer", e.target.value)}
                        placeholder="Respuesta"
                        rows={4}
                        className={`${inputClass} text-sm leading-relaxed`}
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => setCategory(categoryIndex, { items: [...category.items, emptyItem()] })}
                  className={buttonClass}
                >
                  + Pregunta
                </button>
              </div>
            )}
          </section>
        )
      })}

      <button
        type="button"
        onClick={() => {
          setCategories([...value.categories, { name: emptyLocalizedText(), items: [emptyItem()] }])
          setOpenCategory(value.categories.length)
        }}
        className={`${buttonClass} w-full justify-center border-dashed py-4`}
      >
        + Nueva categoría
      </button>

      <p className="text-xs text-neutral-500">
        Las preguntas sin respuesta y las categorías vacías no se muestran en la página.
      </p>

      <SaveBar status={status} dirty={dirty} onSave={save} previewHref="/#faq" />
    </div>
  )
}
