import { Rule, ASTWithSource, ParseSourceSpan } from '@angular-eslint/template-parser';
import { BasicTemplateAstVisitor } from '@angular-eslint/template-parser/builder';
import * as ts from 'typescript';

import { isElementAst } from './utils';

export function createIonLabelRequiredTemplateVisitorClass(elementName: string) {
  return class extends BasicTemplateAstVisitor {
    visitElement(element: Rule.ElementAst, context: any): any {
      if (element.name && element.name === elementName) {
        const ionLabelElement = element.children.find((e): e is Rule.ElementAst =>
          isElementAst(e) && e.name === 'ion-label'
        );

        if (!ionLabelElement) {
          const start = element.sourceSpan.start.offset;
          const length = element.name.length;
          const position = this.getSourcePosition(start) + length + 1;

          this.addFailureAt(
            start + 1,
            length,
            `The ${elementName} requires an ion-label component. It is no longer automatically added.`
          );
        }
      }

      super.visitElement(element, context);
    }
  };
}
