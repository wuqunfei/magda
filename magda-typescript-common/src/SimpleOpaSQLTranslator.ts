import * as _ from "lodash";
import { CompleteRuleResult } from "./OpaCompileResponseParser";

/**
 * This is a generic, simple OPA result to SQL translator
 * It doesn't support table join.
 * For complex case (e.g. table join), it would be much easier to write a customised one within the problem domain
 * rather than write a generic one for all solution here.
 */
class SimpleOpaSQLTranslator {
    private unknowns: string[] = [];

    constructor(unknowns: string[] = []) {
        this.unknowns = unknowns;
    }

    getSqlParameterName(sqlParametersArray: any[], value: any): string {
        sqlParametersArray.push(value);
        const idx = sqlParametersArray.length;
        return `$${idx}`;
    }

    parse(result: CompleteRuleResult, sqlParametersArray: any[] = []) {
        if (result === null) return "FALSE"; // --- no matched rules
        if (result.isCompleteEvaluated) {
            if (result.value === false) return "FALSE";
            else return "TRUE";
        }
        if (!result.residualRules.length) {
            throw new Error("residualRules cannot be empty array!");
        }
        let ruleConditions = result.residualRules.map(r =>
            r.expressions
                .map(e => {
                    if (e.terms.length === 1) {
                        const term = e.terms[0];
                        if (term.isRef()) {
                            if (!e.isNegated) {
                                return term.fullRefString(this.unknowns);
                            } else {
                                return "!" + term.fullRefString(this.unknowns);
                            }
                        } else {
                            return this.getSqlParameterName(
                                sqlParametersArray,
                                term.getValue()
                            );
                        }
                    } else if (e.terms.length === 3) {
                        const [
                            operator,
                            operands
                        ] = e.toOperatorOperandsArray();
                        const identifiers = operands.map(op => {
                            if (op.isRef())
                                return `"${op.fullRefString(this.unknowns)}"`;
                            else
                                return this.getSqlParameterName(
                                    sqlParametersArray,
                                    op.getValue()
                                );
                        });
                        const expStr = `${identifiers[0]} ${operator} ${
                            identifiers[1]
                        }`;
                        if (e.isNegated) return `!(${expStr})`;
                        else return expStr;
                    } else {
                        throw new Error(
                            `Invalid 3 terms expression: ${e.termsAsString()}`
                        );
                    }
                })
                .join(" AND ")
        );
        if (ruleConditions.length > 1) {
            ruleConditions = ruleConditions.map(r => `( ${r} )`);
        }

        return ruleConditions.join(" OR ");
    }
}

export default SimpleOpaSQLTranslator;