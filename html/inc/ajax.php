<?php

/* ---------------------------------------
 *
 *  AJAX call to get winning hound move
 *
 */

if(!isset($_POST['action'])) {
    exit();
}

$action = $_POST['action'];
if($action != 'houndMove') {
    exit();
}

/*

board:

*28*29*30*31
24*25*26*27*
*20*21*22*23
16*17*18*19*
*12*13*14*15
08*09*10*11*
*04*05*06*07
00*01*02*03*

*/

// binomial coefficient: C(n, k)
function binc($n, $k) {
    $p = 1;
    $q = 1;
    for($i = 1; $i <= $k; $i++) {
        $p *= $n--;
        $q *= $i;
    }

    return $p / $q;
}

// zero based order number for combination of 5 from 32
function getIndex($pos) {
    global $size;

    $r = 0;
    
    $l = array();
    $i = 0;
    
    $l[$i++] = 0;
    foreach($pos as $val) {
        $l[$i++] = $val + 1;
    }

    for($i = 1; $i <= 5; $i++) {
        for($j = $l[$i - 1] + 1; $j <= $l[$i] - 1; $j++) {
            $r += binc($size - $j, 5 - $i);
        }
    }
    
    return $r;
}

// support FH game class
class fhGame {
    protected $bSet;
    protected $bPos;
    protected $bCell;
    protected $bData;

    // set up the class object
    function __construct($gameInput) {
        $this->init($gameInput);
    }

    // process input data
    protected function init($gameInput) {
        global $game;
        
        $this->bData =& $game;

        $this->processGameInput($gameInput);
        $this->initPos();
        $this->initCell();
    }

    // get input data
    protected function processGameInput($gameInput) {
        $this->bSet = $gameInput;
    }
    
    // convert cell position from x,y to numeric
    protected function xy2num($x, $y) {
        return (8 - $y) * 4 + ($x + $x % 2) / 2 - 1;
    }

    // normalize current game configuration
    protected function initPos() {
        $gameSet = $this->bSet;

        $fox = -1;

        $gamePos = array();
        foreach($gameSet as $val) {
            $pos = $this->xy2num($val['x'], $val['y']);
            $gamePos[] = $pos;

            if($val['order'] == 5) {
                $fox = $pos;
            }
        }

        sort($gamePos);
        $gamePos = array($gamePos, array_search($fox, $gamePos));

        $this->bPos = $gamePos;
    }
    
    // convert configuration to cell based structure
    protected function buildCell($gPos) {
        $cells = array();
        foreach($gPos[0] as $key => $val) {
            $cells[$val] = ($key == $gPos[1] ? "fox" : "hound");
        }

        return $cells;
    }

    // cell based structure for the input configuration
    protected function initCell() {
        $gameCell = array();
        $gamePos = $this->bPos;
        $this->bCell = $this->buildCell($gamePos);
    }

    // winner for a game position
    protected function getPosWin($gamePos) {
        global $game;

        $ind = getIndex($gamePos[0]);
        $binNum = $ind * 5 + $gamePos[1];
        $charNum = ($binNum - $binNum % 8) / 8;

        $char = $game[$charNum+1];
        $rest = 7 - $binNum % 8;
        while($rest--) {
            $char /= 2;
        }

        return $char % 2;
    }

    // replace chip and normalize new configuration
    protected function changePos($gPos, $oldPos, $newPos) {
        $cells = $this->buildCell($gPos);
        unset($cells[$oldPos]);
        $cells[$newPos] = "hound";
        ksort($cells);
        $retVal = array();
        $i = 0;
        foreach($cells as $key => $val) {
            $retVal[0][$i] = $key;
            if($val == "fox") {
                $retVal[1] = $i;
            }
            $i++;
        }

        return $retVal;
    }

    // check possible hound move for w/l value
    protected function checkPos($gamePos, $hound, $change) {
        $hound = $gamePos[0][$hound];
        $y = 8 - ($hound - $hound % 4) / 4;
        $x = 1 + $hound % 4 * 2 + $y % 2;

        $retVal = array();
        $retVal['x0'] = $x;
        $retVal['y0'] = $y;
    
        $y++;
        if($change % 2) {
            $x++;
        } else {
            $x--;
        }
        if(1 <= $x && 1 <= $y && $x <= 8 && $y <= 8) {
            $pos = $this->xy2num($x, $y);
            if(!isset($this->bCell[$pos])) {
                $cPos = $this->changePos($gamePos, $hound, $pos);
                $posWin = $this->getPosWin($cPos);
                if($posWin) {
                    $retVal['x1'] = $x;
                    $retVal['y1'] = $y;
                    return $retVal;
                }
            }
        }

        return false;
    }

    // output prepared for JSON
    protected function generateOuput($move) {
        return $move;
    }

    // public method to get winning move for hounds
    public function getHoundMove() {
        $gamePos = $this->bPos;
        $posWin = $this->getPosWin($gamePos);

        if($posWin) {
            $order = range(0, 4);
            shuffle($order);
            foreach($order as $val) {
                if($gamePos[1] != $val) {
                    $change = rand(0,1);
                    for($i = 0; $i < 2; $i++) {
                        $move = $this->checkPos($gamePos, $val, ($i + $change) % 2);
                        if($move) {
                            $move['result'] = 'success';
                            return $this->generateOuput($move);
                        }
                    }
                }
            }
        }

        $move = array();
        $move['result'] = 'error';
        return $move;
    }
}

// using "normal" game configurations
$size = 32;

// read strategy file
$fname = "../../strategy/foxhound.bin";
$fh = fopen($fname, "rb");
$strategy = fread($fh, filesize($fname));
fclose($fh);

// convert strategy file contents into integer array
$game = unpack("C*", $strategy);

// using game input find a winning hound move
$gameInput = json_decode($_POST['gameInput'], true);
$fh = new fhGame($gameInput);

$move = $fh->getHoundMove();
if(!$move) {
    $move = array('error' => 'error');
}

// output
header('Content-Type: application/json');
echo json_encode($move);

?>
