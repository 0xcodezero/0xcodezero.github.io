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
    var brain = CalculatorBrain()

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
        
        if let result = brain.pushOperation(operation) {
            displayValue = result
        }else
        {
            displayValue = 0; // TODO
        }
    }
    
    @IBAction func enter() {
        userEnteredAlreadyADigit = false
        if let result = brain.pushOperand(displayValue)
        {
            displayValue = result;
        }else
        {
            displayValue = 0; // TODO
        }
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

