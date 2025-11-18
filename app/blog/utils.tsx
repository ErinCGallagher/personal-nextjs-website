import fs from 'fs'
import path from 'path'

type Metadata = {
  title: string
  publishedAt: string
  summary: string
  image?: string
  tags?: string[]
  featured?: string
}

export function getTagColor(tag: string) {
  const tagLower = tag.toLowerCase();
  if (tagLower === 'camping') return '#7971ea';
  if (tagLower === 'food') return '#20c997';
  if (tagLower === 'hiking') return '#2f89fc';
  if (tagLower === 'safari') return '#dd2ffcd8';
  return '#3b82f6';
}

export function getBlogPosts() {
  return getMDXData(path.join(process.cwd(), 'app', 'blog', 'posts'))
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === '.mdx')
}

function readMDXFile(filePath: fs.PathOrFileDescriptor) {
  let rawContent = fs.readFileSync(filePath, 'utf-8')
  return parseFrontmatter(rawContent)
}

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, '').trim()
  let frontMatterLines = frontMatterBlock.trim().split('\n')
  let metadata: Partial<Metadata> = {}

  frontMatterLines.forEach((line) => {
    let [key, ...valueArr] = line.split(': ')
    let value = valueArr.join(': ').trim()
    value = value.replace(/^['"](.*)['"]$/, '$1') // Remove quotes

    const trimmedKey = key.trim()
    if (trimmedKey === 'tags') {
      metadata.tags = value.split(',').map(tag => tag.trim())
    } else if (trimmedKey === 'title' || trimmedKey === 'publishedAt' || trimmedKey === 'summary' || trimmedKey === 'image' || trimmedKey === 'featured') {
      metadata[trimmedKey] = value
    }
  })

  return { metadata: metadata as Metadata, content }
}

function getMDXData(dir: string) {
  let mdxFiles = getMDXFiles(dir)
  return mdxFiles.map((file) => {
    let { metadata, content } = readMDXFile(path.join(dir, file))
    let slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
    }
  })
}