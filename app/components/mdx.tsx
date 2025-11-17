import Link from 'next/link'
import Image from 'next/image'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { highlight } from 'sugar-high'
import React from 'react'
import remarkGfm from 'remark-gfm'
import { ImageGrid4 } from './image-grid-4'

function Table({ data }: any) {
  let headers = data.headers.map((header: any, index: number) => (
    <th key={index}>{header}</th>
  ))
  let rows = data.rows.map((row: any, index: number) => (
    <tr key={index}>
      {row.map((cell: any, cellIndex: number) => (
        <td key={cellIndex}>{cell}</td>
      ))}
    </tr>
  ))

  return (
    <table>
      <thead>
        <tr>{headers}</tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  )
}

function CustomLink(props: any) {
  let href = props.href

  if (href.startsWith('/')) {
    return (
      <Link href={href} {...props}>
        {props.children}
      </Link>
    )
  }

  if (href.startsWith('#')) {
    return <a {...props} />
  }

  return <a target="_blank" rel="noopener noreferrer" {...props} />
}

function RoundedImage(props: any) {
  return <Image alt={props.alt} className="rounded-lg" {...props} />
}

function Code({ children, ...props }: any) {
  let codeHTML = highlight(children)
  return <code dangerouslySetInnerHTML={{ __html: codeHTML }} {...props} />
}

function slugify(str: any) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/&/g, '-and-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
}

function createHeading(level: number) {
  const Heading = ({ children }: any) => {
    let slug = slugify(children)
    const Tag = `h${level}` as const
    return (
      <div>
        <a id={slug} className="anchor" href={`#${slug}`} />
        {React.createElement(Tag, { className: `heading-${level}` }, children)}
      </div>
    )
  }

  Heading.displayName = `Heading${level}`

  return Heading
}

let components = {
  h1: createHeading(1),
  h2: createHeading(2),
  h3: createHeading(3),
  h4: createHeading(4),
  h5: createHeading(5),
  h6: createHeading(6),
  Image: RoundedImage,
  a: CustomLink,
  code: Code,
  Table,
  ImageGrid4,
}

export async function CustomMDX(props: any) {
  return (
    <MDXRemote
      source={props.source}
      components={{ ...components, ...(props.components || {}) }}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [],
        },
      }}
    />
  )
}