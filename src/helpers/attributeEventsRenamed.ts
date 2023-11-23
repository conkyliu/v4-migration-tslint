import { Rule } from '@angular-eslint/template-parser';
import { BasicTemplateAstVisitor } from '@angular-eslint/template-parser/builder';

function generateErrorMessage(elementName: string, attrName: string, replacement: string) {
  return `The ${attrName} event of ${elementName} has been renamed. Use ${replacement} instead.`;
}

export function createAttributesRenamedTemplateVisitorClass(
  elementNames: string[] | undefined,
  replacementMap: Map<string, string>
) {
  return class extends BasicTemplateAstVisitor {
    visitElement(element: Rule.ElementAst, context: any): any {
      if (!elementNames || elementNames.includes(element.name)) {
        this.checkAttributesForReplacements(element);
      }

      super.visitElement(element, context);
    }

    private checkAttributesForReplacements(element: Rule.ElementAst) {
      for (const output of element.outputs) {
        const replacement = replacementMap.get(output.name);

        if (replacement) {
          const start = output.sourceSpan.start.offset + 1;
          const length = output.name.length;
          const position = this.getSourcePosition(start);

          this.addFailureAt(start, length, generateErrorMessage(element.name, output.name, replacement), [
            this.createReplacement(position, length, replacement),
          ]);
        }
      }
    }
  };
}
