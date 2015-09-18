<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Fox and Hounds</title>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
<link href="css/style.css" rel="stylesheet" type="text/css" />
</head>

<body>
<div class="fh-game">
    <div id="fh-title"><h1>Fox and Hounds</h1></div>
    <div id="fh-menu">
        <div id="fh-restart">Start New Game</div>
        <div id="fh-turn-player"></div>
        <div class='clr'></div>
    </div>
    <div class="fh-board-container">
        <canvas id="fh-board">
        <span id="no-html5">Your Browser Does Not Support HTML5's Canvas Feature. Please Try Again Using Either Chrome Or Safari.</span>
        </canvas>
    </div>
</div>
<div id="test-console"></div>
<script type="text/javascript" src="js/fh.js"></script>
<script type="text/javascript" src="js/utils.js"></script>
</body>
</html>