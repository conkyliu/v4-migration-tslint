import { Rule, ASTWithSource, ParseSourceSpan } from '@angular-eslint/template-parser';
import { NgWalker } from '@angular-eslint/builder';
import { BasicTemplateAstVisitor } from '@angular-eslint/template-parser/builder';
import * as Lint from 'tslint';
import * as ts from 'typescript';

function generateDescription(elementName: string, newElementName: string) {
  return `The ${elementName} component is now named ${newElementName}.`;
}

export function createElementRenameTemplateVisitorClass(elementName: string, newElementName: string) {
  return class extends BasicTemplateAstVisitor {
    visitElement(element: Rule.ElementAst, context: any): any {
      if (element.name && element.name === elementName) {
        const startTagStart = element.sourceSpan.start.offset;
        const startTagLength = element.name.length;
        const startTagPosition = this.getSourcePosition(startTagStart) + 1;
        const endTagStart = element.endSourceSpan.start.offset;
        const endTagLength = element.name.length;
        const endTagPosition = this.getSourcePosition(endTagStart) + 2;

        this.addFailureAt(
          startTagStart + 1,
          startTagLength,
          generateDescription(element.name, newElementName),
          [
            Lint.Replacement.replaceFromTo(
              startTagPosition,
              startTagPosition + startTagLength,
              newElementName
            ),
            Lint.Replacement.replaceFromTo(
              endTagPosition,
              endTagPosition + endTagLength,
              newElementName
            ),
          ]
        );
      }

      super.visitElement(element, context);
    }
  };
}

export function createElementRenameRuleClass(
  ruleName: string,
  elementName: string,
  newElementName: string
) {
  return class extends Lint.Rules.AbstractRule {
    public static metadata: Lint.IRuleMetadata = {
      ruleName: ruleName,
      type: 'functionality',
      description: generateDescription(elementName, newElementName),
      options: null,
      optionsDescription: 'Not configurable.',
      typescriptOnly: false,
      hasFix: true,
    };

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
      return this.applyWithWalker(
        new NgWalker(sourceFile, this.getOptions(), {
          templateVisitorCtrl: createElementRenameTemplateVisitorClass(
            elementName,
            newElementName
          ),
        })
      );
    }
  };
}
