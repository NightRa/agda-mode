"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var React = require('react');
var util_1 = require('util');
var Expr_1 = require('./Expr');
var Location_1 = require('./Location');
var Suggestion_1 = require('./Suggestion');
var Error = (function (_super) {
    __extends(Error, _super);
    function Error() {
        _super.apply(this, arguments);
    }
    Error.prototype.render = function () {
        var error = this.props.children;
        var _a = this.props, jumpToGoal = _a.jumpToGoal, jumpToLocation = _a.jumpToLocation;
        var content = '';
        switch (error.kind) {
            case 'BadConstructor': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                "The constructor ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.constructor), 
                React.createElement("br", null), 
                "does not construct an element of ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.constructorType), 
                React.createElement("br", null), 
                "when checking that the expression ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr), 
                React.createElement("br", null), 
                "has type ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.exprType));
            case 'CaseSingleHole': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                "Right hand side must be a single hole when making a case distinction", 
                React.createElement("br", null), 
                "when checking that the expression ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr), 
                React.createElement("br", null), 
                "has type ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.exprType), 
                React.createElement("br", null));
            case 'ConstructorTarget': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                "The target of a constructor must be the datatype applied to its parameters, ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr), 
                " isn't", 
                React.createElement("br", null), 
                "when checking the constructor ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.ctor), 
                React.createElement("br", null), 
                "in the declaration of ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.decl), 
                React.createElement("br", null));
            case 'DefinitionTypeMismatch': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                "Type mismatch:", 
                React.createElement("br", null), 
                "expected: ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expected), 
                " of type ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expectedType), 
                React.createElement("br", null), 
                React.createElement("span", null, "  "), 
                "actual: ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.actual), 
                React.createElement("br", null), 
                "when checking the definition of ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr));
            case 'FunctionType': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr), 
                " should be a function type, but it isn't", 
                React.createElement("br", null), 
                "when checking that ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr), 
                " is a valid argument to a function of type ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.exprType), 
                React.createElement("br", null));
            case 'MissingDefinition': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                "Missing definition for ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr));
            case 'MissingType': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                "Missing type signature for left hand side ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr), 
                React.createElement("br", null), 
                "when scope checking the declaration ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.decl));
            case 'MultipleDefinition': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                "Multiple definitions of ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr), 
                React.createElement("br", null), 
                "Previous definition at ", 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.locationPrev), 
                React.createElement("br", null), 
                "when scope checking the declaration", 
                React.createElement("br", null), 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.decl), 
                " : ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.declType));
            case 'NotInScope': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                "Not in scope: ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr), 
                React.createElement("br", null), 
                React.createElement(Suggestion_1.default, {jumpToGoal: jumpToGoal}, error.suggestion));
            case 'Parse': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                React.createElement("span", {className: "text-error"}, error.message), 
                React.createElement("br", null), 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr));
            case 'PatternMatchOnNonDatatype': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.nonDatatype), 
                " has type ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.exprType), 
                React.createElement("br", null), 
                "when checking that the expression ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr), 
                React.createElement("br", null), 
                "has type ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.exprType));
            case 'RHSOmitted': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                "The right-hand side can only be omitted if there is an absurd pattern, () or ", 
                ", in the left-hand side.", 
                React.createElement("br", null), 
                "when checking that the expression ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr), 
                React.createElement("br", null), 
                "has type ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.exprType));
            case 'Termination': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                "Termination checking failed for the following functions:", 
                React.createElement("br", null), 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr), 
                React.createElement("br", null), 
                "Problematic calls:", 
                React.createElement("br", null), 
                error.calls.map(function (call, i) { return React.createElement("span", {key: i}, 
                    React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, call.expr), 
                    React.createElement("br", null), 
                    React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, call.location)); }));
            case 'TypeMismatch': return React.createElement("p", {className: "error"}, 
                React.createElement(Location_1.default, {jumpToLocation: jumpToLocation}, error.location), 
                React.createElement("br", null), 
                "Type mismatch:", 
                React.createElement("br", null), 
                "expected: ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expected), 
                React.createElement("br", null), 
                React.createElement("span", null, "  "), 
                "actual: ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.actual), 
                React.createElement("br", null), 
                "when checking that the expression ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.expr), 
                React.createElement("br", null), 
                "has type ", 
                React.createElement(Expr_1.default, {jumpToGoal: jumpToGoal}, error.exprType));
            case 'Unparsed': return React.createElement("p", {className: "error"}, error.input);
            default: return React.createElement("p", {className: "error"}, util_1.inspect(error, false, null));
        }
    };
    return Error;
}(React.Component));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Error;
//# sourceMappingURL=Error.js.map