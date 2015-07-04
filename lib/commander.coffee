Core = require './core'
Promise = require 'bluebird'
_ = require 'lodash'
{log, warn, error} = require './logger'
{OutOfGoalError, EmptyGoalError, QueryCancelledError} = require './error'

toCamalCase = (str) ->
    str.split('-')
        .map (str, i) =>
            if i is 0
                str
            else
                str.charAt(0).toUpperCase() + str.slice(1)
        .join('')
toDescription = (normalization) ->
    switch normalization
        when 'Simplified' then ""
        when 'Instantiated' then "(no normalization)"
        when 'Normalised' then "(full normalization)"

class Commander
    loaded: false
    constructor: (@core) ->
        @panel          = @core.panel
        @highlight      = @core.highlight
        @executable     = @core.executable
        @panelModel     = @core.panelModel
        @textBuffer     = @core.textBuffer
        @inputMethod    = @core.inputMethod
        @config         = @core.config
        @highlight      = @core.highlight
        @handler        = @core.handler
        @filepath       = @core.filepath
    command: (raw) ->
        {command, method, option} = @parse raw
        log "Commander", "loaded: #{@loaded}\n command: #{command}\n normalization: #{option}"

        # some commands can only be executed after "loaded"
        exception = ['load', 'input-symbol']
        if @loaded or _.contains exception, command
            Promise.resolve @[method](option)
                .catch OutOfGoalError, @textBuffer.warnOutOfGoal
                .catch EmptyGoalError, @textBuffer.warnEmptyGoal
                .catch QueryCancelledError, => console.log 'query cancelled'
                .catch (e) -> throw e

    parse: (raw) ->
        result = raw.match(/^agda-mode:((?:\w|\-)*)(?:\[(\w*)\])?/)
        return {
            command: result[1]
            method: toCamalCase result[1]
            option: result[2]
        }

    ################
    #   Commands   #
    ################

    load: ->
        @panel.show()
        @highlight.destroyAllMarker()
        @executable.load().then (process) =>
            @panelModel.set 'Loading'
            @loaded = true

    quit: -> if @loaded
        @loaded = false
        @executable.quit()
        @panel.hide()
        @textBuffer.removeGoals()

    restart: ->
        @quit()
        @load()

    compile: ->
        @executable.compile()

    toggleDisplayOfImplicitArguments: ->
        @executable.toggleDisplayOfImplicitArguments()

    showConstraints: ->
        @executable.showConstraints()

    showGoals: ->
        @executable.showGoals()

    nextGoal: ->
        @textBuffer.nextGoal()

    previousGoal: ->
        @textBuffer.previousGoal()

    whyInScope: ->
        @panelModel.set "Scope info", [], 'info', 'name:'
        @panelModel.query().then (expr) =>
            @textBuffer.getCurrentGoal().done (goal) =>
                # goal-specific
                @executable.whyInScope expr, goal
                @textBuffer.focus()
            , =>
                # global command
                @executable.whyInScope expr
                @textBuffer.focus()

    inferType: (normalization) ->
        @panelModel.set "Infer type #{toDescription normalization}", [], 'info', 'expression to infer:'
        @panelModel.query().then (expr) =>
            @textBuffer.getCurrentGoal().done (goal) =>
                # goal-specific
                @executable.inferType normalization, expr, goal
                @textBuffer.focus()
            , =>
                # global command
                @executable.inferType normalization, expr
                @textBuffer.focus()

    moduleContents: (normalization) ->
        @panelModel.set "Module contents #{toDescription normalization}", [], 'info', 'module name:'
        @panelModel.query().then (expr) =>
            @textBuffer.getCurrentGoal().done (goal) =>
                # goal-specific
                @executable.moduleContents normalization, expr, goal
                @textBuffer.focus()
            , =>
                # global command
                @executable.moduleContents normalization, expr
                @textBuffer.focus()

    computeNormalForm: ->
        @panelModel.set "Compute normal form", [], 'info', 'expression to normalize:'
        @panelModel.query()
            .then (expr) =>
                @textBuffer.getCurrentGoal().done (goal) =>
                    # goal-specific
                    @executable.computeNormalForm expr, goal
                    @textBuffer.focus()
                , =>
                    # global command
                    @executable.computeNormalForm expr
                    @textBuffer.focus()

    computeNormalFormIgnoreAbstract: ->
        @panelModel.set 'Compute normal form (ignoring abstract)', [], 'info', 'expression to normalize:'
        @panelModel.query().then (expr) =>
            @textBuffer.getCurrentGoal().done (goal) =>
                # goal-specific
                @executable.computeNormalFormIgnoreAbstract expr, goal
                @textBuffer.focus()
            , =>
                # global command
                @executable.computeNormalFormIgnoreAbstract expr
                @textBuffer.focus()

    give: ->
        @textBuffer.getCurrentGoal()
            .then @textBuffer.checkGoalContent
                title: "Give"
                placeholder: "expression to give:"
                error: "Nothing to give"
            .then @executable.give

    refine: ->
        @textBuffer.getCurrentGoal()
            .then @executable.refine

    auto: ->
        @textBuffer.getCurrentGoal()
            .then @executable.auto

    case: ->
        @textBuffer.getCurrentGoal()
            .then @textBuffer.checkGoalContent
                title: "Case"
                placeholder: "expression to case:"
                error: "Nothing to case"
            .then @executable.case

    goalType: (normalization) ->
        @textBuffer.getCurrentGoal()
            .then @executable.goalType normalization

    context: (normalization) ->
        @textBuffer.getCurrentGoal()
            .then @executable.context normalization

    goalTypeAndContext: (normalization) ->
        @textBuffer.getCurrentGoal()
            .then @executable.goalTypeAndContext normalization

    goalTypeAndInferredType: (normalization) ->
        @textBuffer.getCurrentGoal()
            .then @executable.goalTypeAndInferredType normalization

    inputSymbol: ->
        unless @loaded
            @panel.show()
            @panelModel.set 'Input Method only, Agda not loaded', [], 'warning'
        @inputMethod.activate()

module.exports = Commander
