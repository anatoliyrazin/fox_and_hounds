var fhGame = function() {

    // board sizes
    var cellLen = 50;
    var intBorderLen = 2;
    var fieldLen = 30;
    var extBorderLen = 2;
    var frameLen = 12;
    var outBoardLen = intBorderLen + fieldLen + extBorderLen + frameLen;
    var canvasLen = cellLen * 8 + outBoardLen * 2;

    // FH colors
    var blackCell = "rgb(158,86,27)";
    var whiteCell = "rgb(230,204,171)";
    var borderColor = "rgb(0,0,0)";
    var pcHound = "#FFFFFF";
    var pcFox = "#000000";

    // FH players
    var gamePlayer = "";
    var turnPlayer = pcFox;

    // board and set
    var gameSet = new Array();
    var fhBoard;
    var fhContext;

    // moving
    var chipMoving;
    var mousePos;
    var moveIndex = 0;
    var maxIndex = 12;

    // timer handler
    var hInt = false;

    // listeners
    var clickListener = false;
    var dragListener = false;
    var dropListener = false;

    // canvas mouse location
    getMousePt = function(e) {
        var mousePoint = new Object();
        var offsetX = jQuery('#fh-board').offset().left;
        var offsetY = jQuery('#fh-board').offset().top;

        if((e.pageX != undefined) && (e.pageY != undefined)) {
            mousePoint.px = e.pageX;
            mousePoint.py = e.pageY;
        } else {
            mousePoint.px = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            mousePoint.py = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
    
        mousePoint.px -= offsetX;
        mousePoint.py -= offsetY;
    
        return mousePoint;
    }

    // game chip: fox or hound
    // fox: 1-4; hound: 5
    chip = function(x,y,n) {
        this.order = n;
        this.x = x;
        this.y = y;
    }

    // testing console
    updateTestSet = function() {
        var txt = '';
        // reserved for testing   
        // jQuery('#test-console').html(txt);
    }

    // set up game - chips
    resetChips = function() {
        for(var i = 2; i < 9; i += 2) {
            gameSet.push(new chip(i, 1, i/2));
        }
        gameSet.push(new chip(5, 8, 5));
    }

    // start game
    this.start = function() {
        fhBoard = document.getElementById("fh-board");
        fhContext = fhBoard.getContext("2d");    

        this.reset(pcFox);
    }

    // reset game
    this.reset = function(player) {
        turnPlayer = pcFox;
        gamePlayer = player;

        gameSet = new Array();
        mousePos =  new Object();

        resetChips();

        this.draw();
    }

    // canvas: draw rectangle
    drawRect = function(rLeft, rTop, rWidth, rHeight, rLine, rColor, rFill) {
        if(rLine) {
            fhContext.lineWidth = rLine;
            fhContext.strokeStyle = rColor;
        }
        if(rFill) {
            fhContext.fillStyle = rFill;
        }
        fhContext.beginPath();
        fhContext.rect(rLeft, rTop, rWidth, rHeight);
        fhContext.closePath();
        if(rLine) {
            fhContext.stroke();
        }
        if(rFill) {
            fhContext.fill();            
        }
    }

    // canvas: draw circle
    drawCircle = function(centerX, centerY, cRadius, cLine, cColor, cFill) {
        if(cLine) {
            fhContext.lineWidth = cLine;
            fhContext.strokeStyle = cColor;
        }
        if(cFill) {
            fhContext.fillStyle = cFill;
        }
        fhContext.beginPath();
        fhContext.arc(centerX, centerY, cRadius, 0, 2 * Math.PI, false);
        fhContext.closePath();
        if(cLine) {
            fhContext.stroke();
        }
        if(cFill) {
            fhContext.fill();            
        }
    }

    // draw game cell
    drawCell = function(x,y) {
        var color;
        if((x + y) % 2) {
            color = blackCell;
        } else {
            color = whiteCell;
        }
    
        drawRect((x - 1) * cellLen, (y - 1) * cellLen, cellLen, cellLen, false, false, color);
    }

    // add mouse click listener
    this.addClickListener = function() {
        var o = this;
        clickListener = function(e) {
            o.clickChip(e);
        }
        fhBoard.addEventListener("mousedown", clickListener, false);
    }

    // add mouse drag listener
    this.addDragListener = function() {
        var o = this;
        dragListener = function(e) {
            o.dragChip(e);
        }
        fhBoard.addEventListener("mousemove", dragListener, false);
    }

    // add mouse drop listener
    this.addDropListener = function() {
        var o = this;
        dropListener = function(e) {
            o.dropChip(e);
        }
        fhBoard.addEventListener("mouseup", dropListener, false);
    }

    // draw game board
    drawBoard = function() {
        var rx = intBorderLen + fieldLen + extBorderLen / 2;
        drawRect(-rx, -rx, cellLen * 8 + rx * 2, cellLen * 8 + rx * 2, extBorderLen, borderColor, false);

        rx = intBorderLen + fieldLen;
        drawRect(-rx, -rx, cellLen * 8 + rx * 2, cellLen * 8 + rx * 2, false, false, whiteCell);

        drawRect(-intBorderLen / 2, -intBorderLen / 2, cellLen * 8 + intBorderLen, cellLen * 8 + intBorderLen, intBorderLen, borderColor, false);

        for(var i = 1; i < 9; i++) {
            for(var j = 1; j < 9; j++) {                    
                drawCell(i,j);
            }
        }            
    }

    // draw single game chip
    drawChip = function(x, y, color) {
        drawCircle(x, y, (cellLen * 0.5) - cellLen / 8, false, false, color);
    
        otherColor = (color == pcFox ? pcHound : pcFox);
        drawCircle(x, y, (cellLen * 0.5) - cellLen / 8, 1, otherColor, false);
        drawCircle(x, y, (cellLen * 0.5) - (cellLen / 8) * 2, 1, otherColor, false);
        drawCircle(x, y, (cellLen * 0.5) - (cellLen / 8) * 3, 1, otherColor, false);
    }

    // draw all game chips
    drawChips = function() {
        for(var i = 0; i < gameSet.length; i++) {
            var chipColor = gameSet[i].order < 5 ? pcHound : pcFox;
            drawChip((gameSet[i].x - 1) * cellLen + (cellLen * 0.5), (gameSet[i].y - 1) * cellLen + (cellLen * 0.5), chipColor);
        }
    }

    // draw / redraw game
    this.draw = function() {            
        fhBoard.width = canvasLen;
        fhBoard.height = canvasLen;
        jQuery('.fh-game').css({width:canvasLen+'px'});
    
        fhContext.translate(outBoardLen, outBoardLen);
        drawBoard();
        drawChips();
        fhContext.translate(-outBoardLen, -outBoardLen);
    
        if(turnPlayer == pcHound) {
            document.getElementById("fh-turn-player").innerHTML = "Play: Hound";
        } else if(turnPlayer == pcFox) {
            document.getElementById("fh-turn-player").innerHTML = "Play: Fox";
        }
        document.getElementById("fh-turn-player").style.backgroundColor = (turnPlayer == pcFox ? pcHound : pcFox);
        document.getElementById("fh-turn-player").style.color = turnPlayer;

        if(!clickListener) {
            this.addClickListener();
        }
        updateTestSet();
    }

    // catch mouse cursor position on the game board
    getCursorPos = function(e) {
        var mousePoint = getMousePt(e);

        mousePos.x = Math.ceil((mousePoint.px - outBoardLen) * (1 / cellLen));
        mousePos.y = Math.ceil((mousePoint.py - outBoardLen) * (1 / cellLen));
    }

    // check if a chip is on the position
    checkForChip = function(pos) {
        for(var i = 0; i < gameSet.length; i++) {
            if((gameSet[i].x == pos.x) && (gameSet[i].y == pos.y)) {
                return i + 1;
            }
        }

        return 0;
    }

    // handle mouse click to move chip
    this.clickChip = function(e) {
        if(turnPlayer == gamePlayer) {
            getCursorPos(e);

            var isChip = checkForChip(mousePos);

            if(isChip) {
                var i = isChip - 1;
                if(gameSet[i].order != 5) {
                    return;
                }
                chipMoving = gameSet[i];
                gameSet.splice(i, 1);

                this.addDragListener();
                this.addDropListener();
            }
        }
    }

    // handle mouse drag while moving chip
    this.dragChip = function(e) {
        getCursorPos(e);
        this.draw();
   
        var mousePoint = getMousePt(e);

        drawChip(mousePoint.px, mousePoint.py, turnPlayer);
    }

    // check for legal chip move
    checkPlayerMove = function() {
        var playerMove = false;

        if(turnPlayer == pcHound) {
        } else {
            if(Math.abs(chipMoving.x - mousePos.x) == 1 && Math.abs(chipMoving.y - mousePos.y) == 1) {
                playerMove = true;
            }
        }

        return playerMove;
    }

    // check if cell exists and empty
    isCellAvailable = function(x, y) {
        if(x < 1 || x > 8 || y < 1 || y > 8) {
            return false;
        }

        for(var i = 0; i < gameSet.length; i++) {
            if(gameSet[i].x == x && gameSet[i].y == y) {
                return false;
            }
        }

        return true;
    }

    // check for winner
    getWinner = function() {
        foxChip = getChipPos(5);
        if(foxChip.y == 1) {
            return pcFox;
        } else {
            for(var i = -1; i <= 1; i += 2) {
                for(var j = -1; j <= 1; j += 2) {
                    var foxMove = isCellAvailable(foxChip.x + i, foxChip.y + j);
                    if(foxMove) {
                        return false;
                    }
                }
            }
            return pcHound;
        }
    }

    // move hound chip
    this.moveHound = function(move) {
        var pos = {'x':move.x0,'y':move.y0};
        var i = checkForChip(pos) - 1;
        if(i < 0) {
            // error
            return;
        }
        chipMoving = gameSet[i];
        gameSet.splice(i, 1);

        moveIndex = 0;
        var o = this;
        hInt = setInterval(function() {
            o.moveChip(move);
        }, 10);
    }

    // handle hound play
    this.playHound = function() {
        var o = this;
        setTimeout(function() {
            o.getHoundMove();
        }, 200);
    }

    // check for winner and stop or continue game
    this.checkEndGame = function() {
        var winner = getWinner();
        if(winner) {
            var o = this;
            fhBoard.removeEventListener("mousedown",clickListener,false);
            fhBoard.removeEventListener("mousemove",dragListener,false);
            fhBoard.removeEventListener("mouseup",dropListener,false);
            this.draw();

            if(winner == gamePlayer) {
                alert("You won!");
            } else {
                alert("Game over");
            }
        } else {
            if(turnPlayer == pcHound) {
                turnPlayer = pcFox;
            } else if(turnPlayer == pcFox) {
                turnPlayer = pcHound;
                this.playHound();
            }
        }
    }

    // handle mouse drop after chip move
    this.dropChip = function(e) {
        getCursorPos(e);
        var checkChip = checkForChip(mousePos);
        var checkMove = checkPlayerMove();

        if(!checkChip && checkMove) {
            var newChip = new chip(mousePos.x, mousePos.y, chipMoving.order);
            gameSet.push(newChip);

            this.checkEndGame();
        } else {
            gameSet.push(chipMoving);
        }

        fhBoard.removeEventListener("mousemove",dragListener,false);
        fhBoard.removeEventListener("mouseup",dropListener,false);

        this.draw();

        chipMoving = false;
    }

    // set hound on the new position
    this.newHound = function(bx, by) {
        var newChip = new chip(bx, by, chipMoving.order);
        gameSet.push(newChip);

        this.checkEndGame();

        this.draw();

        chipMoving = false;
    }

    // move chip loop position
    this.moveChip = function(move) {
        this.draw();
        moveIndex++;

        // console.log(moveIndex); console.log(maxIndex);
        var x = move.x0;
        var y = move.y0;

        if(moveIndex < maxIndex) {
            x += (move.x1 - move.x0) * moveIndex / maxIndex;
            y += (move.y1 - move.y0) * moveIndex / maxIndex;
        } else {
            x = move.x1;
            y = move.y1;
        }

        var px = (x - 1) * cellLen + (cellLen * 0.5) + 0.5;
        var py = (y - 1) * cellLen + (cellLen * 0.5) + 0.5;
        px += outBoardLen;
        py += outBoardLen;

        drawChip(px, py, turnPlayer);
        if(moveIndex >= maxIndex) {
            clearInterval(hInt);
            this.newHound(x, y);
        }
    }

    // AJAX to get winning hound move
    this.getHoundMove = function() {
        var params = new Object();
        params.action = 'houndMove';
        params.gameInput = JSON.stringify(gameSet);

        var o = this;
        jQuery.ajax({type: "POST",
                      url: 'inc/ajax.php',
                     data: params,
                dataType: 'json',
                success: function(resp) {
                               // console.log(JSON.stringify(resp));
                               if(resp.result != 'success') {
                                   console.log(resp.result);
                               }
                               var chipMove = resp;
                               o.moveHound(chipMove);
                           },
                    error: function(jqXHR, textStatus, errorThrown) {
                               console.log(jqXHR); console.log(textStatus); console.log(errorThrown);
                           }
        });
    }

    // position of a chip by order number
    getChipPos = function(order) {
        for(var i = 0; i < gameSet.length; i++) {
            if(gameSet[i].order == order) {
                return gameSet[i];
            }
        }

        return false;
    }

    // restart game upon request
    this.restart = function() {
        var answer = confirm("The game will restart. Continue");
        if(answer == true) {
            this.reset(pcFox);
        }
    }
}
