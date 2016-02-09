 //
//  ViewController.swift
//  Calculator
//
//  Created by Ahmed Ghalab on 2/5/16.
//  Copyright © 2016 Codivity, LLC. All rights reserved.
//

import UIKit

class ViewController: UIViewController {

    @IBOutlet weak var display: UILabel!
    var userEnteredAlreadyADigit = false
    

    @IBAction func numberInputAction(sender: UIButton) {
        let digit = sender.currentTitle!
        
        if userEnteredAlreadyADigit {
            display.text = display.text! + digit
        } else {
            display.text = digit
            userEnteredAlreadyADigit = true // (digit != "0")
        }
    }

    @IBAction func operate(sender: UIButton) {
        let operation = sender.currentTitle!
        if userEnteredAlreadyADigit
        {
            enter()
        }
        switch operation
        {
            case "×": performOperation {$0 * $1}
            case "+": performOperation {$0 + $1}
            case "÷": performOperation {$1 / $0}
            case "−": performOperation {$1 - $0}
            case "√": performOperation2 {sqrt($0)}
        default: break
        }
    }
    var operandStack =  Array<Double>()
    
    @IBAction func enter() {
        userEnteredAlreadyADigit = false
        operandStack.append(displayValue)
        print("operandStack = \(operandStack)")
    }
    
    func performOperation (operation : (Double, Double) -> Double)
    {
        if operandStack.count >= 2 {
            displayValue = operation(operandStack.removeLast(), operandStack.removeLast())
            enter()
        }
    }
    
    func performOperation2 (operation : Double -> Double)
    {
        if operandStack.count >= 1 {
            displayValue = operation(operandStack.removeLast())
            enter()
        }
    }
    
    func divide(operand1: Double, operand2:Double) -> Double
    {
        if operand1 >= 0.0000001 ||  operand1 <= -0.0000001 {
            return 1.0 / operand1 * operand2;
        }
        return 999999999999.0;
    }
    
    var displayValue : Double {
        get{
            return NSNumberFormatter().numberFromString(display.text!)!.doubleValue
        }
        
        set{
            display.text = "\(newValue)"
            userEnteredAlreadyADigit = false
        }
    }
}

