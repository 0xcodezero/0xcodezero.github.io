//
//  CalculatorBrain.swift
//  Calculator
//
//  Created by Ahmed Ghalab on 2/9/16.
//  Copyright © 2016 Codivity, LLC. All rights reserved.
//

import Foundation

class CalculatorBrain {
    
    private enum Op : CustomStringConvertible
    {
        case Operand(Double)
        case UnaryOperation (String, Double -> Double)
        case BinaryOperation (String, (Double, Double) -> Double)
        
        var description : String{
            get{
                switch self{
                    case .Operand(let operand):
                        return "\(operand)"
                    case .UnaryOperation(let symbol, _):
                        return symbol
                    case .BinaryOperation(let symbol, _):
                        return symbol
                }
            }
        }
    }
    
    private var opStack = [Op]()
    private var knownOps = [String: Op]()
    
    init(){
        func learnOp(op:Op) {
            knownOps[op.description] = op
        }
        learnOp(Op.BinaryOperation("×", *))
        learnOp(Op.BinaryOperation("+", +))
        learnOp(Op.BinaryOperation("÷"){$1 / $0})
        learnOp(Op.BinaryOperation("−"){$1 - $0})
        learnOp(Op.UnaryOperation("√", sqrt));
    }
    
    private func evaluate(ops :[Op]) -> (result : Double? , remainingOps:[Op])
    {
        if !ops.isEmpty {
            var remainingOps = ops
            let opItem = remainingOps .removeLast()
            switch opItem
            {
                case .Operand(let operand):
                    return (operand,remainingOps)
                case .UnaryOperation(_, let operation):
                    let operandEvaluation = evaluate(remainingOps)
                    if let operandResult  = operandEvaluation.result{
                        return (operation(operandResult),operandEvaluation.remainingOps)
                    }
                case .BinaryOperation(_, let operation):
                    let operandEvaluation = evaluate(remainingOps)
                    let secondOperandEvaluation = evaluate(operandEvaluation.remainingOps)
                    let operandResult  = operandEvaluation.result;
                    let secondOperandResult  = secondOperandEvaluation.result;
                    if (operandResult != nil && secondOperandResult != nil) {
                        return (operation(operandResult!,secondOperandResult!),secondOperandEvaluation.remainingOps)
                    }
            }
        }
        return (nil, ops)
    }
    
    func evaluate() -> Double? {
        let (result, reminder) = evaluate(opStack)
        print("\(opStack) = \(result) with \(reminder) left over")
        return result
    }
    
    
    func pushOperation(symbol: String) -> Double?
    {
        if let operation = knownOps[symbol] {
            opStack.append(operation)
        }
        return evaluate()
    }
    
    func pushOperand(operand: Double) -> Double?
    {
        opStack.append(Op.Operand(operand))
        
        return evaluate()
    }
}
