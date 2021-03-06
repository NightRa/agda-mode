import * as Promise from 'bluebird';
import * as _ from 'lodash';
import { OutOfGoalError, EmptyGoalError, QueryCancelledError, NotLoadedError } from './error';
import { Command, Normalization, CommandResult, View, CommandKind } from './types';
import Core from './core';

declare var atom: any;

function resolveCommand(commandKind: string): (any) => Promise<CommandResult> {
    return () => {
        return Promise.resolve(<CommandResult>{
            status: 'Issued',
            command: commandKind
        });
    }
}

function toDescription(normalization: Normalization): string {
    switch(normalization) {
        case 'Simplified':      return '';
        case 'Instantiated':    return '(no normalization)';
        case 'Normalised':      return '(full normalization)';
        default:                throw `unknown normalization: ${normalization}`;
    }
}


export default class Commander {
    private loaded: boolean;

    constructor(private core: Core) {}

    activate(command: Command) {
        // some commands can only be executed after 'loaded'
        const exception = ['Load', 'Quit', 'Info', 'InputSymbol'];
        if(this.loaded || _.includes(exception, command.kind)) {
            this.dispatchCommand(command)
                .catch(QueryCancelledError, () => {
                    this.core.view.set('Query cancelled', [], View.Style.Warning);
                })
                .catch((error) => { // catch all the rest
                    console.error(command);
                    // throw error;
                });
        }
    }

    dispatchCommand(command: Command): Promise<CommandResult> {
        switch(command.kind) {
            case 'Load':          return this.load();
            case 'Quit':          return this.quit();
            case 'Restart':       return this.restart();
            case 'Compile':       return this.compile();
            case 'ToggleDisplayOfImplicitArguments':
                return this.toggleDisplayOfImplicitArguments();
            case 'Info':          return this.info();
            case 'SolveConstraints':
                return this.solveConstraints();
            case 'ShowConstraints':
                return this.showConstraints();
            case 'ShowGoals':
                return this.showGoals();
            case 'NextGoal':      return this.nextGoal();
            case 'PreviousGoal':  return this.previousGoal();
            case 'ToggleDocking':  return this.toggleDocking();
            case 'WhyInScope':    return this.whyInScope();
            case 'InferType':
                return this.inferType(command.normalization);
            case 'ModuleContents':
                return this.moduleContents(command.normalization);
            case 'ComputeNormalForm':
                return this.computeNormalForm();
            case 'ComputeNormalFormIgnoreAbstract':
                return this.computeNormalFormIgnoreAbstract();
            case 'Give':          return this.give();
            case 'Refine':        return this.refine();
            case 'Auto':          return this.auto();
            case 'Case':          return this.case();
            case 'GoalType':
                return this.goalType(command.normalization);
            case 'Context':
                return this.context(command.normalization);
            case 'GoalTypeAndContext':
                return this.goalTypeAndContext(command.normalization);
            case 'GoalTypeAndInferredType':
                return this.goalTypeAndInferredType(command.normalization);
            case 'InputSymbol':   return this.inputSymbol();
            case 'InputSymbolCurlyBracket':
                return this.inputSymbolInterceptKey(command.kind, '{');
            case 'InputSymbolBracket':
                return this.inputSymbolInterceptKey(command.kind, '[');
            case 'InputSymbolParenthesis':
                return this.inputSymbolInterceptKey(command.kind, '(');
            case 'InputSymbolDoubleQuote':
                return this.inputSymbolInterceptKey(command.kind, '"');
            case 'InputSymbolSingleQuote':
                return this.inputSymbolInterceptKey(command.kind, '\'');
            case 'InputSymbolBackQuote':
                return this.inputSymbolInterceptKey(command.kind, '`');
            default:    throw `undispatched command type ${command}`
        }
    }

    //
    //  Commands
    //

    load(): Promise<CommandResult> {
        const currentMountingPosition = this.core.view.store.getState().view.mountAt.current;
        this.core.view.mount(currentMountingPosition);
        this.core.view.activate();
        return this.core.process.load()
            .then(() => {
                this.loaded = true;
            })
            .then(resolveCommand('Load'));
    }

    quit(): Promise<CommandResult> {
        this.core.view.deactivate();
        const currentMountingPosition = this.core.view.store.getState().view.mountAt.current;
        this.core.view.unmount(currentMountingPosition);
        if (this.loaded) {
            this.loaded = false;
            this.core.textBuffer.removeGoals();
            this.core.highlightManager.destroyAll();
            return this.core.process.quit()
                .then(resolveCommand('Quit'));
        } else {
            return Promise.resolve(<CommandResult>{ status: 'Issued', command: 'Quit' });
        }
    }

    restart(): Promise<CommandResult> {
        this.quit();
        return this.load();
    }


    compile(): Promise<CommandResult> {
        return this.core.process.compile()
            .then(resolveCommand('Compile'));
    }

    toggleDisplayOfImplicitArguments(): Promise<CommandResult> {
        return this.core.process.toggleDisplayOfImplicitArguments()
            .then(resolveCommand('ToggleDisplayOfImplicitArguments'));
    }

    info(): Promise<CommandResult> {
        return this.core.process.info()
            .then(resolveCommand('Info'));
    }

    solveConstraints(): Promise<CommandResult> {
        return this.core.process.solveConstraints()
            .then(resolveCommand('SolveConstraints'));
    }

    showConstraints(): Promise<CommandResult> {
        return this.core.process.showConstraints()
            .then(resolveCommand('ShowConstraints'));
    }

    showGoals(): Promise<CommandResult> {
        return this.core.process.showGoals()
            .then(resolveCommand('ShowGoals'));
    }

    nextGoal(): Promise<CommandResult> {
        return this.core.textBuffer.nextGoal()
            .then(resolveCommand('NextGoal'));
    }

    previousGoal(): Promise<CommandResult> {
        return this.core.textBuffer.previousGoal()
            .then(resolveCommand('PreviousGoal'));
    }

    toggleDocking(): Promise<CommandResult> {
        return this.core.view.toggleDocking()
            .then(resolveCommand('ToggleDocking'));
    }

    //
    //  The following commands may have a goal-specific version
    //

    whyInScope(): Promise<CommandResult> {
        return this.core.view.query('Scope info', [], View.Style.PlainText, 'name:')
            .then((expr) => {
                return this.core.textBuffer.getCurrentGoal()
                    .then((goal) => {
                        // goal-specific
                        return this.core.process.whyInScope(expr, goal);
                    })
                    .catch(OutOfGoalError, () => {
                        // global command
                        return this.core.process.whyInScope(expr);
                    });
            })
            .then(resolveCommand('WhyInScope'));

    }

    inferType(normalization: Normalization): Promise<CommandResult> {
        return this.core.textBuffer.getCurrentGoal()
            .then((goal) => {
                // goal-specific
                if (goal.isEmpty()) {
                    return this.core.view.query(`Infer type ${toDescription(normalization)}`, [], View.Style.PlainText, 'expression to infer:')
                        .then(this.core.process.inferType(normalization, goal))
                        .then(resolveCommand('InferType'));
                } else {
                    return this.core.process.inferType(normalization, goal)(goal.getContent())
                        .then(resolveCommand('InferType'));
                }
            })
            .catch(() => {
                // global command
                return this.core.view.query(`Infer type ${toDescription(normalization)}`, [], View.Style.PlainText, 'expression to infer:')
                    .then(this.core.process.inferType(normalization))
                    .then(resolveCommand('InferType'));
            })
    }


    moduleContents(normalization: Normalization): Promise<CommandResult> {
        return this.core.view.query(`Module contents ${toDescription(normalization)}`, [], View.Style.PlainText, 'module name:')
            .then((expr) => {
                return this.core.textBuffer.getCurrentGoal()
                    .then(this.core.process.moduleContents(normalization, expr))
                    .catch((error) => {
                        return this.core.process.moduleContents(normalization, expr)();
                    });
            })
            .then(resolveCommand('ModuleContents'));
    }


    computeNormalForm(): Promise<CommandResult> {
        return this.core.textBuffer.getCurrentGoal()
            .then((goal) => {
                if (goal.isEmpty()) {
                    return this.core.view.query(`Compute normal form`, [], View.Style.PlainText, 'expression to normalize:')
                        .then(this.core.process.computeNormalForm(goal))
                } else {
                    return this.core.process.computeNormalForm(goal)(goal.getContent())
                }
            })
            .catch(OutOfGoalError, () => {
                return this.core.view.query(`Compute normal form`, [], View.Style.PlainText, 'expression to normalize:')
                    .then(this.core.process.computeNormalForm())
            })
            .then(resolveCommand('ComputeNormalForm'));

    }


    computeNormalFormIgnoreAbstract(): Promise<CommandResult> {
        return this.core.textBuffer.getCurrentGoal()
            .then((goal) => {
                if (goal.isEmpty()) {
                    return this.core.view.query(`Compute normal form (ignoring abstract)`, [], View.Style.PlainText, 'expression to normalize:')
                        .then(this.core.process.computeNormalFormIgnoreAbstract(goal))
                } else {
                    return this.core.process.computeNormalFormIgnoreAbstract(goal)(goal.getContent())
                }
            })
            .catch(OutOfGoalError, () => {
                return this.core.view.query(`Compute normal form (ignoring abstract)`, [], View.Style.PlainText, 'expression to normalize:')
                    .then(this.core.process.computeNormalFormIgnoreAbstract())
            })
            .then(resolveCommand('ComputeNormalFormIgnoreAbstract'));
    }

    //
    //  The following commands only working in the context of a specific goal
    //

    give(): Promise<CommandResult> {
        return this.core.textBuffer.getCurrentGoal()
            .then((goal) => {
                if (goal.isEmpty()) {
                    return this.core.view.query('Give', [], View.Style.PlainText, 'expression to give:')
                        .then(goal.setContent);
                } else {
                    return goal;
                }
            })
            .then(this.core.process.give)
            .catch(OutOfGoalError, () => {
                this.core.view.set('Out of goal', ['`Give` is a goal-specific command, please place the cursor in a goal'], View.Style.Error);
            })
            .then(resolveCommand('Give'));
    }

    refine(): Promise<CommandResult> {
        return this.core.textBuffer.getCurrentGoal()
            .then(this.core.process.refine)
            .catch(OutOfGoalError, () => {
                this.core.view.set('Out of goal', ['`Refine` is a goal-specific command, please place the cursor in a goal'], View.Style.Error);
            })
            .then(resolveCommand('Refine'));
    }

    auto(): Promise<CommandResult> {
        return this.core.textBuffer.getCurrentGoal()
            .then(this.core.process.auto)
            .catch(OutOfGoalError, () => {
                this.core.view.set('Out of goal', ['`Auto` is a goal-specific command, please place the cursor in a goal'], View.Style.Error);
            })
            .then(resolveCommand('Auto'));
    }

    case(): Promise<CommandResult> {
        return this.core.textBuffer.getCurrentGoal()
            .then((goal) => {
                if (goal.isEmpty()) {
                    return this.core.view.query('Case', [], View.Style.PlainText, 'the argument to case:')
                        .then(goal.setContent);
                } else {
                    return goal;
                }
            })
            .then(this.core.process.case)
            .catch(OutOfGoalError, () => {
                this.core.view.set('Out of goal', ['`Case` is a goal-specific command, please place the cursor in a goal'], View.Style.Error);
            })
            .then(resolveCommand('Case'));
    }

    goalType(normalization: Normalization): Promise<CommandResult> {
        return this.core.textBuffer.getCurrentGoal()
            .then(this.core.process.goalType(normalization))
            .catch(OutOfGoalError, () => {
                this.core.view.set('Out of goal', ['"Goal Type" is a goal-specific command, please place the cursor in a goal'], View.Style.Error);
            })
            .then(resolveCommand('GoalType'));
    }

    context(normalization: Normalization): Promise<CommandResult> {
        return this.core.textBuffer.getCurrentGoal()
            .then(this.core.process.context(normalization))
            .catch(OutOfGoalError, () => {
                this.core.view.set('Out of goal', ['"Context" is a goal-specific command, please place the cursor in a goal'], View.Style.Error);
            })
            .then(resolveCommand('Context'));
    }

    goalTypeAndContext(normalization: Normalization): Promise<CommandResult> {
        return this.core.textBuffer.getCurrentGoal()
            .then(this.core.process.goalTypeAndContext(normalization))
            .catch(OutOfGoalError, () => {
                this.core.view.set('Out of goal', ['"Goal Type & Context" is a goal-specific command, please place the cursor in a goal'], View.Style.Error);
            })
            .then(resolveCommand('GoalTypeAndContext'));
    }

    goalTypeAndInferredType(normalization: Normalization): Promise<CommandResult> {
        return this.core.textBuffer.getCurrentGoal()
            .then(this.core.process.goalTypeAndInferredType(normalization))
            .catch(OutOfGoalError, () => {
                this.core.view.set('Out of goal', ['"Goal Type & Inferred Type" is a goal-specific command, please place the cursor in a goal'], View.Style.Error);
            })
            .then(resolveCommand('GoalTypeAndInferredType'));
    }

    inputSymbol(): Promise<CommandResult> {
        const miniEditorEnabled = this.core.view.store.getState().inputMethod.enableInMiniEditor;
        const miniEditorFocused = this.core.view.miniEditor && this.core.view.miniEditor.isFocused();
        const shouldNotActivate = miniEditorFocused && !miniEditorEnabled;
        const editor = this.core.view.getFocusedEditor();
        if (atom.config.get('agda-mode.inputMethod') && !shouldNotActivate) {
            if (!this.loaded) {
                const currentMountingPosition = this.core.view.store.getState().view.mountAt.current;
                this.core.view.mount(currentMountingPosition);
                this.core.view.activate();
                this.core.view.set('Not loaded', [], View.Style.PlainText);
            }
            this.core.inputMethod.activate();
        } else {
            editor.insertText('\\');
        }
        return Promise.resolve(<CommandResult>{ status: 'Issued', command: 'InputSymbol' });
    }

    inputSymbolInterceptKey(kind: CommandKind, key: string): Promise<CommandResult> {
        this.core.inputMethod.interceptAndInsertKey(key);
        return Promise.resolve(<CommandResult>{ status: 'Issued', command: kind });
    }
}
