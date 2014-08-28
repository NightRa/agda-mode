{View} = require 'atom'

module.exports =
class AgdaModeView extends View
  @content: ->
    @div class: 'agda-mode overlay from-bottom', =>
      @div "The AgdaMode package is Alive! It's ALIVE!", class: "message"

  initialize: (serializeState) ->
    atom.workspaceView.command "agda-mode:load", => @toggle()

  # Returns an object that can be retrieved when package is activated
  serialize: ->

  # Tear down any state and detach
  destroy: ->
    @detach()

  toggle: ->
    console.log "AgdaModeView was toggled!"
    if @hasParent()
      @detach()
    else
      atom.workspaceView.append(this)