import { Rule, ASTWithSource, ParseSourceSpan } from '@angular-eslint/template-parser';
import { BasicTemplateAstVisitor } from '@angular-eslint/template-parser/builder';

function generateErrorMessage(elementName: string, attrName: string, replacement: string) {
  return `The ${attrName} attribute of ${elementName} has been renamed. Use ${replacement} instead.`;
}

export function createAttributesRenamedTemplateVisitorClass(elementNames: string[] | undefined, replacementMap: Map<string, string>) {
  return class extends BasicTemplateAstVisitor {
    visitElement(element: Rule.ElementAst, context: any): any {
      if (!elementNames || elementNames.includes(element.name)) {
        this.checkAttributesForReplacements(element);
      }

      super.visitElement(element, context);
    }

    private checkAttributesForReplacements(element: Rule.ElementAst) {
      for (const attr of element.attrs) {
        const replacement = replacementMap.get(attr.name);

        if (replacement) {
          const start = attr.sourceSpan.start.offset;
          const length = attr.name.length;
          const position = this.getSourcePosition(start);

          this.addFailureAt(start, length, generateErrorMessage(element.name, attr.name, replacement), [
            this.createReplacement(position, length, replacement),
          ]);
        }
      }
    }

    private createReplacement(position: ParseSourceSpan, length: number, text: string) {
      return new Lint.Replacement(position.start.offset, length, text);
    }
  };
}
