import {
  AlertCircle,
  ImageIcon,
  FileText,
  Braces,
  ChartBar,
  Code,
  Pi,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/ui/code-block";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HStack } from "@/components/ui/stack";
import { Markdown } from "@/components/ui/markdown";

import type { Result } from "@e2b/code-interpreter";
import type { ClientToolConfig } from "@/toolkits/types";
import type { baseRunCodeTool } from "./base";

const ResultWrapper: React.FC<{
  type: string;
  Icon: React.FC<{ className?: string }>;
  color: string;
  children: React.ReactNode;
  index: number;
}> = ({ type, Icon, color, children, index }) => (
  <AccordionItem value={`result-${index}`} className="">
    <AccordionTrigger className="cursor-pointer p-0 hover:no-underline">
      {" "}
      <HStack className="items-center gap-2">
        <Icon className={`size-4 ${color}`} />
        <span className="text-muted-foreground text-xs font-medium">
          {type}
        </span>
      </HStack>
    </AccordionTrigger>
    <AccordionContent className="bg-muted mt-2 rounded-md p-2">
      {children}
    </AccordionContent>
  </AccordionItem>
);

const ResultItem: React.FC<{ result: Result; index: number }> = ({
  result,
  index,
}) => {
  const resultRenderers = [
    {
      condition: (r: Result) => r.png ?? r.jpeg,
      render: (r: Result) => (
        <ResultWrapper
          type={r.png ? "PNG Image" : "JPEG Image"}
          color="text-purple-500"
          Icon={ImageIcon}
          index={index}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/${r.png ? "png" : "jpeg"};base64,${r.png ?? r.jpeg}`}
            alt={`Result ${index + 1}`}
            className="h-auto max-w-full rounded-md border"
          />
        </ResultWrapper>
      ),
    },
    {
      condition: (r: Result) => r.svg ?? r.html,
      render: (r: Result) => (
        <ResultWrapper
          type={r.svg ? "SVG" : "HTML"}
          color={r.svg ? "text-green-500" : "text-orange-500"}
          Icon={r.svg ? ImageIcon : FileText}
          index={index}
        >
          <div
            className={`${r.svg ? "bg-muted rounded-md border p-2" : "text-sm"}`}
            dangerouslySetInnerHTML={{ __html: r.svg ?? r.html ?? "" }}
          />
        </ResultWrapper>
      ),
    },
    {
      condition: (r: Result) => r.markdown ?? r.text ?? r.latex,
      render: (r: Result) => (
        <ResultWrapper
          type={r.markdown ? "Markdown" : r.latex ? "LaTeX" : "Text"}
          color={
            r.markdown
              ? "text-blue-500"
              : r.latex
                ? "text-red-500"
                : "text-gray-500"
          }
          Icon={r.latex ? Pi : FileText}
          index={index}
        >
          <Markdown>{r.markdown ?? r.text ?? r.latex ?? ""}</Markdown>
        </ResultWrapper>
      ),
    },
    {
      condition: (r: Result) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        r.data ?? r.chart ?? r.json ?? r.javascript ?? r.extra,
      render: (r: Result) => {
        const type = r.data
          ? "Data"
          : r.chart
            ? "Chart"
            : r.json
              ? "JSON"
              : r.javascript
                ? "JavaScript"
                : "Extra Data";
        const color = r.data
          ? "text-cyan-500"
          : r.chart
            ? "text-pink-500"
            : r.json
              ? "text-yellow-500"
              : r.javascript
                ? "text-yellow-600"
                : "bg-gray-400";
        const Icon = r.chart ? ChartBar : r.javascript ? Code : Braces;
        const value =
          (r.data ?? r.chart)
            ? JSON.stringify(r.data ?? r.chart, null, 2)
            : (r.json ??
              r.javascript ??
              JSON.stringify(r.extra ?? "", null, 2));
        const language = r.javascript ? "javascript" : "json";

        return (
          <ResultWrapper type={type} color={color} Icon={Icon} index={index}>
            <CodeBlock language={language} value={value} />
          </ResultWrapper>
        );
      },
    },
  ];

  const renderer = resultRenderers.find(({ condition }) => condition(result));
  return renderer ? renderer.render(result) : null;
};

export const e2bRunCodeToolConfigClient: ClientToolConfig<
  typeof baseRunCodeTool.inputSchema.shape,
  typeof baseRunCodeTool.outputSchema.shape
> = {
  CallComponent: ({ args, isPartial }) => {
    return (
      <div className="w-full space-y-2">
        <h1 className="text-muted-foreground text-sm font-medium">
          {isPartial ? "Writing Python Code" : "Executing Python Code"}
        </h1>
        {args.code && <CodeBlock language="python" value={args.code} />}
      </div>
    );
  },
  ResultComponent: ({ result, args: { code } }) => {
    const hasResults = result.results && result.results.length > 0;
    const hasLogs =
      result.logs.stdout.length > 0 || result.logs.stderr.length > 0;

    return (
      <div className="space-y-2">
        <Accordion type="single" collapsible>
          <AccordionItem value="args">
            <AccordionTrigger className="cursor-pointer p-0 hover:no-underline">
              <h2 className="text-muted-foreground text-sm font-medium">
                Code
              </h2>
            </AccordionTrigger>
            <AccordionContent className="p-0 pt-2">
              <CodeBlock language="python" value={code} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        {hasResults && (
          <Accordion type="single" collapsible defaultValue="results">
            <AccordionItem value="results" className="space-y-2">
              <AccordionTrigger className="cursor-pointer p-0 hover:no-underline">
                <h2 className="text-muted-foreground text-sm font-medium">
                  Results
                </h2>
              </AccordionTrigger>
              <AccordionContent className="border-l p-0 py-2 pl-2">
                <Accordion
                  type="multiple"
                  defaultValue={result.results.map(
                    (_, index) => `result-${index}`,
                  )}
                >
                  <div className="space-y-2">
                    {result.results.map((res, index) => (
                      <ResultItem key={index} result={res} index={index} />
                    ))}
                  </div>
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {hasLogs && (
          <Accordion type="single" collapsible>
            <AccordionItem value="logs">
              <AccordionTrigger className="cursor-pointer p-0 hover:no-underline">
                <h3 className="text-primary flex items-center gap-2 text-sm font-medium">
                  Execution Logs
                  {result.logs.stdout.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {result.logs.stdout.length} stdout
                    </Badge>
                  )}
                  {result.logs.stderr.length > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {result.logs.stderr.length} stderr
                    </Badge>
                  )}
                </h3>
              </AccordionTrigger>
              <AccordionContent className="p-0 pt-2">
                <div className="space-y-2">
                  {result.logs.stdout.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs font-medium">
                          Standard Output
                        </span>
                      </div>
                      <div className="bg-muted rounded-md p-3">
                        <pre className="text-muted-foreground text-xs whitespace-pre-wrap">
                          {result.logs.stdout.join("\n")}
                        </pre>
                      </div>
                    </div>
                  )}

                  {result.logs.stderr.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-3 w-3 text-red-600" />
                        <span className="text-muted-foreground text-xs font-medium">
                          Standard Error
                        </span>
                      </div>
                      <div className="rounded-md bg-red-50 p-3 dark:bg-red-950/20">
                        <pre className="text-xs whitespace-pre-wrap text-red-700 dark:text-red-400">
                          {result.logs.stderr.join("\n")}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {!hasResults && !hasLogs && (
          <p className="text-muted-foreground text-sm">
            Code executed successfully with no output
          </p>
        )}
      </div>
    );
  },
};
