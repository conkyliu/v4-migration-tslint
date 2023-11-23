import { Rule, ASTWithSource, ParseSourceSpan } from '@angular-eslint/template-parser';
import { BasicTemplateAstVisitor } from '@angular-eslint/template-parser/builder';

function generateErrorMessage(elementName: string, attrName: string, attrValue: string, replacement: string) {
  return `The ${attrName}="${attrValue}" attribute/value of ${elementName} should be written as ${replacement}.`;
}

export function createAttributeValuesRenamedTemplateVisitorClass(elementNames: string[], replacementMap: Map<string, Map<string, string>>) {
  return class extends BasicTemplateAstVisitor {
    visitElement(element: Rule.ElementAst, context: any): any {
      for (const elementName of elementNames) {
        if (element.name === elementName) {
          for (const attr of element.attrs) {
            const attrValueMap = replacementMap.get(attr.name);

            if (attrValueMap) {
              const replacementValue = attrValueMap.get(attr.value);

              if (replacementValue) {
                const start = attr.sourceSpan.start.offset;
                const end = attr.sourceSpan.end.offset;
                const position = this.getSourcePosition(start);
                const replacement = `${attr.name}="${replacementValue}"`;

                this.addFailureAt(start, end - start, generateErrorMessage(elementName, attr.name, attr.value, replacement), [
                  this.createReplacement(position, end - start, replacement),
                ]);
              }
            }
          }
        }
      }

      super.visitElement(element, context);
    }

    private createReplacement(position: ParseSourceSpan, length: number, text: string) {
      return new Lint.Replacement(position.start.offset, length, text);
    }
  };
}
