import React, { memo, useId } from "react";


export type SimpleMarkdownParserProps = {
  id?: string;
  content?: string;
};

const SimpleMarkdownParser = (props: SimpleMarkdownParserProps) => {
  let i = 0;
  const id = props.id || useId();

  const parseMarkdown = (text: string) => {
    const lines = text.split("\n");

    return lines.map((line, index) => {
      if(line.trim() === "")
        return null;

      if(line.startsWith("#")) {
        const content = line.replace(/^#+\s*/, "");
        return <h4 key={`md-link-${id}-skip-inline-${index}`}>{parseInline(content)}</h4>;
      }

      if(line.startsWith("<br") && line.endsWith(">"))
        return <br key={`md-link-${id}-skip-inline-${index}`} />;

      return <p key={`md-link-${id}-skip-inline-${index}`}>{parseInline(line)}</p>;
    });
  };

  const parseInline = (text: string): React.ReactNode => {
    const patterns = [
      { regex: /\[([^\]]+)\]\(([^)]+)\)/, type: "link" },
      { regex: /\*\*(.+?)\*\*/, type: "bold" },
      { regex: /__(.+?)__/, type: "bold" },
      { regex: /\*(.+?)\*/, type: "italic" },
      { regex: /_(.+?)_/, type: "italic" },
    ];

    const match = patterns
      .map(({ regex, type }) => {
        const result = regex.exec(text);
        return result ? { result, type, index: result.index } : null;
      })
      .filter(Boolean)
      .sort((a, b) => !a || !b ? 0 : a.index - b.index)[0];

    if(!match)
      return text;

    const { result, type } = match;

    const before = text.slice(0, result.index);
    const after = text.slice(result.index + result[0].length);

    let element: React.ReactNode;

    switch(type) {
      case "link":
        element = (
          <a key={`md-link-${id}-item-${i++}`} href={result[2]} target="_blank" rel="noopener noreferrer">
            {parseInline(result[1])}
          </a>
        );
        break;
      case "bold":
        element = <strong key={`md-strong-${id}-item-${i++}`}>{parseInline(result[1])}</strong>;
        break;
      case "italic":
        element = <em key={`md-em-${id}-item-${i++}`}>{parseInline(result[1])}</em>;
        break;
      default:
        element = result[0];
    }

    return [
      before ? parseInline(before) : null,
      element,
      after ? parseInline(after) : null,
    ].flat().filter(Boolean);
  };

  return <div>{parseMarkdown(props.content ?? "")}</div>;
};

export default memo(SimpleMarkdownParser);
