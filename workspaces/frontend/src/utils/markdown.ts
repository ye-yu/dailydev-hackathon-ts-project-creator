import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js/lib/common'

const markdown = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
})

const markdownWithHighlight = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
  highlight(str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      const highlighted = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      return `<pre class="hljs"><code>${highlighted}</code></pre>`
    }

    const highlighted = hljs.highlightAuto(str).value
    return `<pre class="hljs"><code>${highlighted}</code></pre>`
  },
})

export function renderMarkdown(value: string | null | undefined): string {
  return markdown.render(value ?? '')
}

export function renderMarkdownInline(value: string | null | undefined): string {
  return markdown.renderInline(value ?? '')
}

export function renderMarkdownWithHighlight(value: string | null | undefined): string {
  return markdownWithHighlight.render(value ?? '')
}
