{EventEmitter} = require 'events'
{Point} = require 'atom'
# manages all "holes" in a editor
class Hole extends EventEmitter

  holes = []

  constructor: (@agda) ->

    text = @agda.editor.getText()
    headIndices = indicesOf text, /\{!/

    for headIndex in headIndices
      point = @agda.editor.buffer.positionForCharacterIndex headIndex
      marker = @agda.editor.markBufferPosition point

    marker.on 'changed', (event) =>
      console.log event.newHeadBufferPosition.toArray()

    @agda.editor.cursors[0].on 'moved', (event) =>
      cursorOld = event.oldBufferPosition
      cursorNew = event.newBufferPosition

      # no go between '{' and '!'
      markerLeft = marker.oldHeadBufferPosition
      markerCenter = markerLeft.translate new Point 0, 1
      markerRight = markerLeft.translate new Point 0, 2

      if cursorNew.isEqual markerCenter
        if cursorOld.isEqual markerLeft # from left -->
          @agda.editor.moveCursorRight()
        else if cursorOld.isEqual markerRight # from right <--
          @agda.editor.moveCursorLeft()
        else # from somewhere else
          @agda.editor.moveCursorRight()

        # direction = cursorNew.compare cursorOld
        # if direction is 1 # =>
        #   console.log '==>'
        #   @agda.editor.moveCursorRight()
        # else if direction is -1 # <=
        #   console.log '<=='
        #   @agda.editor.moveCursorLeft()



    # tailIndices = indicesOf text, /!\}/
    #
    # for headIndex, i in headIndices
    #   tailIndex = tailIndices[i]
    #   headPoint = @agda.editor.buffer.positionForCharacterIndex headIndex
    #   tailPoint = @agda.editor.buffer.positionForCharacterIndex tailIndex
    #   marker = @agda.editor.markBufferRange [headPoint.toArray(), tailPoint.toArray()]
    #   marker.on 'changed', (event) =>
    #     console.log 'changed'
    #     console.log event.oldHeadBufferPosition.toArray(), event.oldTailBufferPosition.toArray()
    #     console.log event.newHeadBufferPosition.toArray(), event.newTailBufferPosition.toArray()

  indicesOf = (string, pattern) ->
    indices = []
    cursor = 0
    result = string.match pattern
    while result
      indices.push result.index + cursor
      cursor += result.index + result[0].length
      string = string.substr (result.index + result[0].length)
      result = string.match pattern
    return indices


module.exports = Hole
