

var piece_board; //盤上の駒の画像のIDを入れておく変数
var piece_black_capture; //先手の駒台の駒の画像のIDを入れておく変数
var piece_white_capture; //後手の駒台の駒の画像のIDを入れておく変数
var piece_promotion_window;  //成／不成を選択するウインドウに表示する駒の画像のIDを入れておく変数
var promotion_window;  //成／不成を選択するウインドウの画像のIDを入れておく変数

var selectedFlgB;  //盤上の駒が選択された状態かどうか
var selectedFlgC;  //持ち駒が選択された状態かどうか
var PromotionWindowFlg;  //成／不成を選択するウインドウが表示されているかどうか

var FromClickDan,FromClickSuji;  //駒を選択するときにクリックしたマスの段と筋
var ToClickDan,ToClickSuji;  //用意したけどけっきょく使わなかった

var selectedKoma; //選択された駒の種類
var teban;  //手番 trueが先手番  falseが後手番

var board = []; //将棋盤の配列
var capture = []; //持ち駒の配列

var slb,slw;

//駒の種類を数字で表す  C++のマクロっぽい表記（大文字）にしてみた
var OUT_OF_BOARD = 128;  
var EMPTY = 0;
var FU = 1;
var KY = 2;
var KE = 3;
var GI = 4;
var KI = 5;
var KA = 6;
var HI = 7;
var OU = 8;
var PROMOTED = 8;
var TO = PROMOTED + FU;
var NY = PROMOTED + KY;
var NK = PROMOTED + KE;
var NG = PROMOTED + GI;
var UM = PROMOTED + KA;
var RY = PROMOTED + HI;
var ENEMY = 16;
var EFU = ENEMY + FU;
var EKY = ENEMY + KY;
var EKE = ENEMY + KE;
var EGI = ENEMY + GI;
var EKI = ENEMY + KI;
var EKA = ENEMY + KA;
var EHI = ENEMY + HI;
var EOU = ENEMY + OU;
var ETO = ENEMY + TO;
var ENY = ENEMY + NY;
var ENK = ENEMY + NK;
var ENG = ENEMY + NG;
var EUM = ENEMY + UM;
var ERY = ENEMY + RY;


//関数いろいろ
//先手の駒かどうか
var BlackKoma = function(koma){
	return (FU <= koma && koma <= RY);
}

//後手の駒かどうか
var WhiteKoma = function(koma){
	return (EFU <= koma && koma <= ERY);
}

//成ることができる駒かどうか
var CanPromoteKoma = function(koma){
	var k = koma & ~ENEMY;
	return (FU <= k && k <= HI && k != KI && k != OU);
}

//駒かどうか
var Koma = function(koma){
	return ((FU <= koma && koma <= RY) || (EFU <= koma && koma <= ERY));
}

//先手の陣地かどうか
var BlackArea = function(dan,suji){
	return (7 <= dan && dan <= 9 && 1 <= suji && suji <= 9);
}

//後手の陣地かどうか
var WhiteArea = function(dan,suji){
	return (1 <= dan && dan <= 3 && 1 <= suji && suji <= 9);
}

//成ることができるかどうか
var CanPromote = function(koma,teban,dan,suji){
	return (CanPromoteKoma(koma) && (BlackKoma(koma) && WhiteArea(dan,suji) || WhiteKoma(koma) && BlackArea(dan,suji)));
}



//将棋盤全体（持ち駒もふくむ）を表示する
var showBoard = function(){

	var b = document.getElementById("board");    //"board"のIDを取得 
	
	for(var dan = 1; dan <= 9; dan++){
	for(var suji = 1; suji <= 9; suji++){
		var c = piece_board[board[dan][suji]].cloneNode(true); //駒画像の要素を複製
		c.style.left = 15 + ((suji - 1) * 46) + "px";         //位置を調節
		c.style.top = 13 + ((dan - 1) * 46) + "px"; 
		b.appendChild(c);                                //"board"に駒画像のノードを追加

		if(board[dan][suji] != EMPTY && board[dan][suji] != OUT_OF_BOARD){  //もしマスに駒があれば
		
			(function(){
				var _dan = dan, _suji = suji;    //danとsujiは1ずつ足されていくので覚えておく
				c.onclick = function(){   //クリックされたらこの関数が呼び出される
					(teban == BlackKoma(board[_dan][_suji]) && !PromotionWindowFlg) ? SelectSelfKoma(_dan,_suji) : SelectEnemyKoma(_dan,_suji);
				};
			})();
		}

		if(board[dan][suji] == EMPTY){    //もしマスに駒がなければ
			(function(){
				var _dan = dan, _suji = suji;
				c.onclick = function(){
					SelectEmptyCell(_dan,_suji);
					}
			})();
		}
	}
	}
	
	//持ち駒の表示
	var cb = document.getElementById("capture_black"), cw = document.getElementById("capture_white");
	var fragmentB = document.createDocumentFragment(), fragmentC = document.createDocumentFragment();
	
	//先手の持ち駒
	for(var koma = FU; koma <= HI; koma++){
		(function(){
		var _koma = koma;
		if(capture[0][_koma] != EMPTY){
			ShowBlackCapture(_koma);
		}
		})();
	}
	
	//後手の持ち駒
	for(var koma = FU; koma <= HI; koma++){
		(function(){
		var _koma = koma;
		if(capture[1][_koma] != EMPTY){
			ShowWhiteCapture(_koma);
		}
		}());
	}
	
	//手番の表示
	var TebanMessage = document.getElementById("TebanMessage");
	
	(teban) ? TebanMessage.innerHTML = "先手番です<br>" : TebanMessage.innerHTML = "後手番です<br>";
};


//手番の駒をクリックしたときにつかう関数
var SelectSelfKoma = function(dan,suji){
	var b = document.getElementById("board");   
	
	if(teban){
		slb.style.left =  14 + ((suji - 1) * 46) + "px";
		slb.style.top = 11 + ((dan - 1) * 46) + "px";
		slb.onclick = function(){
			selectedFlgB = false; 
			slb.parentElement.removeChild(slb);
			}
		b.appendChild(slb);
	}

	else{
		slw.style.left = 15 + ((suji - 1) * 46) + "px";
		slw.style.top = 12 + ((dan - 1) * 46)+ "px";
		slw.onclick = function(){
			selectedFlgB = false; 
			slw.parentElement.removeChild(slw);
		}
		b.appendChild(slw);
	}
	selectedFlgB = true; 
	selectedFlgC = false; 
	selectedKoma = board[dan][suji];
	FromClickDan = dan; FromClickSuji = suji; 
};


//敵の駒をクリックしたときにつかう関数
var SelectEnemyKoma = function(dan,suji){
	var b = document.getElementById("board");
	var cb = document.getElementById("capture_black"), cw = document.getElementById("capture_white");
	
	//盤上の駒を選択している状態なら
	if(selectedFlgB){
		var intteban = +teban;
		capture[intteban ^ 1][board[dan][suji] & ~ENEMY & ~PROMOTED]++;
		
		board[dan][suji] = selectedKoma;
		board[FromClickDan][FromClickSuji] = EMPTY;
		
		selectedFlgB = false; 
		selectedFlgC = false; 
		(teban) ? b.removeChild(slb) : b.removeChild(slw);
		
		if((CanPromote(selectedKoma,teban,dan,suji) || CanPromote(selectedKoma,teban,FromClickDan,FromClickSuji))){
			ShowPromotionWindow(dan,suji);
		}
		
		else{
			selectedKoma = EMPTY;
			teban = !teban;
			showBoard();
		}
	}
	//持ち駒を選択している状態なら
	if(selectedFlgC){
		(teban) ? cb.removeChild(slb) : cw.removeChild(slw);
	}
selectedFlgC = false;

}


//空のマスをクリックしたときにつかう関数
var SelectEmptyCell = function(dan,suji){
	var b = document.getElementById("board");    
	var cb = document.getElementById("capture_black"), cw = document.getElementById("capture_white");
		//もし駒が選択された状態なら
	if(selectedFlgB){
		board[dan][suji] = selectedKoma;   
		board[FromClickDan][FromClickSuji] = EMPTY;  
		selectedFlgB = false;   
		selectedFlgC = false;
		
		if(CanPromote(selectedKoma,teban,dan,suji) || CanPromote(selectedKoma,teban,FromClickDan,FromClickSuji)){
			ShowPromotionWindow(dan,suji);
			(teban) ? b.removeChild(slb) : b.removeChild(slw);
		}
		
		else{
			(teban) ? b.removeChild(slb) : b.removeChild(slw);
			selectedKoma = EMPTY;
			
			teban = !teban;    
			showBoard();    
		}
	}
	
	if(selectedFlgC){
		board[dan][suji] = selectedKoma;  
		var intteban = +teban;
		capture[intteban ^ 1][selectedKoma & ~ENEMY & ~PROMOTED]--;
		(teban) ? cb.removeChild(slb) : cw.removeChild(slw);
		
		if(teban){
		while(cb.firstChild){
			cb.removeChild(cb.firstChild);
		}
		}
		else{
		while(cw.firstChild){
			cw.removeChild(cw.firstChild);
		}
		}
	selectedKoma = EMPTY;

	selectedFlgB = false;   
	selectedFlgC = false;  
	teban = !teban;   
	showBoard();     
	}
	}

	
//先手の持ち駒を表示する関数
var ShowBlackCapture = function(koma){
	var cb = document.getElementById("capture_black"), cw = document.getElementById("capture_white");
	var fragmentB = document.createDocumentFragment(), fragmentC = document.createDocumentFragment();

	for(var i = 1; i <= capture[0][koma]; i++){
		
		var pcb = piece_black_capture[koma].cloneNode(true);
		pcb.style.left = !(koma%2)*72+5+(capture[0][koma]-i)*10 + "px";
		pcb.style.top = (7-koma-(7-koma)%2)/2*46+45+ "px";
	
		if(i == capture[0][koma]){
			pcb.onclick = function(){
			if(teban && !PromotionWindowFlg){
				slb.style.left = !(koma%2)*72+3+ "px";
				slb.style.top = (7-koma-(7-koma)%2)/2*46+43 + "px";
				slb.onclick = function(){
					if(teban){
						slb.parentElement.removeChild(slb);
						selectedFlgC = false; 
					}
				}
				
				selectedFlgC = true; 
				selectedKoma = koma;
				cb.appendChild(slb);
			}
			if(teban){
				selectedFlgB = false; 
			}
			}
		}
	fragmentB.appendChild(pcb);
	}
	cb.appendChild(fragmentB);
}


//後手の持ち駒を表示する関数
var ShowWhiteCapture = function(koma){
	var cb = document.getElementById("capture_black"), cw = document.getElementById("capture_white");
	var fragmentB = document.createDocumentFragment(), fragmentC = document.createDocumentFragment();
	for(var i = 1; i <= capture[1][koma]; i++){

		var pcw = piece_white_capture[koma].cloneNode(true);
		pcw.style.left = (koma%2)*72+30-(capture[1][koma]-i)*10 + "px";
		pcw.style.top = (koma-(koma)%2)/2*46+10 + "px";
		
		if(i == capture[1][koma]){
			pcw.onclick = function(){
				if(!teban  && !PromotionWindowFlg){
					slw.style.left = (koma%2)*72+29+ "px";
					slw.style.top = (koma-(koma)%2)/2*46+10 + "px";
					slw.onclick = function(){
							slw.parentElement.removeChild(slw);
							selectedFlgC = false; 
					}
					
					selectedFlgC = true; 
					selectedKoma = koma | ENEMY;
					cw.appendChild(slw);
				}
			if(!teban){
				selectedFlgB = false; 
			}
			}
		}
		fragmentC.appendChild(pcw);
	}
	cw.appendChild(fragmentC);
}


//成／不成を選択するウインドウを表示する関数
var ShowPromotionWindow = function(dan,suji){
	var b = document.getElementById("board");   
	var promotion_window = document.getElementById("promotion_window");
	var fragment = document.createDocumentFragment();
	
	var WindowClickFlg;
	
	var ShowPromotionWindow = function (){
		pw_img.style.left = (suji - 1) * 46 - 10 + "px";
		pw_img.style.top = 8 + ((dan - 1) * 46) + "px";
		
		var ppw = piece_promotion_window[selectedKoma & ~ENEMY];
		ppw.style.left = (suji - 1) * 46 +38 + "px";
		ppw.style.top = 8 + ((dan - 1) * 46) + "px";
		ppw.onclick = function(){
			b.removeChild(pw_img);
			b.removeChild(ppw);
			b.removeChild(pc);
			board[dan][suji] += PROMOTED;
			PromotionWindowFlg = false;
		}

		var pc = piece_black_capture[selectedKoma & ~ENEMY & ~PROMOTED];
		pc.style.left = (suji - 1) * 46 - 8 + "px";
		pc.style.top = 8 + ((dan - 1) * 46) + "px";
		pc.onclick = function(){
			b.removeChild(pw_img);
			b.removeChild(ppw);
			b.removeChild(pc);
			PromotionWindowFlg = false;
		}
		
		fragment.appendChild(pw_img);
		fragment.appendChild(ppw);
		fragment.appendChild(pc);

	};
	
	PromotionWindowFlg = true;
	ShowPromotionWindow();
	b.appendChild(fragment);

	var timerID = setInterval(function(){
	if(!PromotionWindowFlg){
		clearInterval(timerID);
		timerID = null;
		selectedKoma = EMPTY;
		teban = !teban;
		showBoard();
	}
	},100);	
}


//ページ読み込み時に以下の処理を実行
window.onload = function(){    

	//手番を初期化
	teban = true; //先手番（true）
	
	//選択フラグを初期化
	selectedFlgB = false;
	selectedFlgC = false;
	PromotionWindowFlg = false;
	
	//選択した状態の画像のIDを取得
	slb = document.getElementById("selected_black"); slw = document.getElementById("selected_white");  
	
	//pieceにコマ画像のIDを入れておく
	piece_board = [
	document.getElementById("cell_board"),
	document.getElementById("FU_black"),
	document.getElementById("KY_black"),
	document.getElementById("KE_black"),
	document.getElementById("GI_black"),
	document.getElementById("KI_black"),
	document.getElementById("KA_black"),
	document.getElementById("HI_black"),
	document.getElementById("OU_black"),
	document.getElementById("TO_black"),
	document.getElementById("NY_black"),
	document.getElementById("NK_black"),
	document.getElementById("NG_black"),
	document.getElementById("KI_black"),
	document.getElementById("UM_black"),
	document.getElementById("RY_black"),
	document.getElementById("cell_board"),
	document.getElementById("FU_white"),
	document.getElementById("KY_white"),
	document.getElementById("KE_white"),
	document.getElementById("GI_white"),
	document.getElementById("KI_white"),
	document.getElementById("KA_white"),
	document.getElementById("HI_white"),
	document.getElementById("OU_white"),
	document.getElementById("TO_white"),
	document.getElementById("NY_white"),
	document.getElementById("NK_white"),
	document.getElementById("NG_white"),
	document.getElementById("KI_white"),
	document.getElementById("UM_white"),
	document.getElementById("RY_white"),
	document.getElementById("cell_board"),
	];
	

	piece_black_capture = [
	document.getElementById("cell_capture"),
	document.getElementById("FU_black_capture"),
	document.getElementById("KY_black_capture"),
	document.getElementById("KE_black_capture"),
	document.getElementById("GI_black_capture"),
	document.getElementById("KI_black_capture"),
	document.getElementById("KA_black_capture"),
	document.getElementById("HI_black_capture")
	];
	
	piece_white_capture = [
	document.getElementById("cell_capture"),
	document.getElementById("FU_white_capture"),
	document.getElementById("KY_white_capture"),
	document.getElementById("KE_white_capture"),
	document.getElementById("GI_white_capture"),
	document.getElementById("KI_white_capture"),
	document.getElementById("KA_white_capture"),
	document.getElementById("HI_white_capture")
	];
	
	piece_promotion_window = [
	document.getElementById("cell_capture"),
	document.getElementById("TO_window"),
	document.getElementById("NY_window"),
	document.getElementById("NK_window"),
	document.getElementById("NG_window"),
	document.getElementById("cell_capture"),
	document.getElementById("UM_window"),
	document.getElementById("RY_window"),
	];
	
	pw_img = document.getElementById("pw_img");

	//boardの９×９の範囲はEMPTY、それ以外はOUT_OF_BOARD
	for(var i = 0; i <= 10; i++){
		board[i] = [];
		for(var j = 0; j <= 10; j++){
			board[i][j] = OUT_OF_BOARD;	
		}
	}
		
	for(var i = 1; i <= 9; i++){
	for(var j = 1; j <= 9; j++){
			board[i][j] = EMPTY;	
	}
	}

	for(var i = 0; i <= 1; i++){
		capture[i] = [];
		for(var j = 0; j <= HI; j++){
			capture[i][j] = EMPTY;
		}	
	}

	capture[0][HI] = 1;
	capture[0][KA] = 2;
	capture[0][KI] = 2;
	capture[0][GI] = 2;
	capture[0][KE] = 2;
	capture[0][KY] = 2;
	capture[0][FU] = 4;

	capture[1][HI] = 3;
	capture[1][KA] = 2;
	capture[1][KI] = 2;
	capture[1][GI] = 2;
	capture[1][KE] = 2;
	capture[1][KY] = 2;
	capture[1][FU] = 4;

	//boardに駒を初期配置
	board[1][1] = EKY;
	board[1][2] = EKE;
	board[1][3] = EGI;
	board[1][4] = EKI;
	board[1][5] = EOU;
	board[1][6] = EKI;
	board[1][7] = EGI;
	board[1][8] = EKE;
	board[1][9] = EKY;
	board[2][2] = EHI;
	board[2][8] = EKA;
	board[3][1] = EFU;
	board[3][2] = EFU;
	board[3][3] = EFU;
	board[3][4] = EFU;
	board[3][5] = EFU;
	board[3][6] = EFU;
	board[3][7] = EFU;
	board[3][8] = EFU;
	board[3][9] = EFU;
	board[9][1] = KY;
	board[9][2] = KE;
	board[9][3] = GI;
	board[9][4] = KI;
	board[9][5] = OU;
	board[9][6] = KI;
	board[9][7] = GI;
	board[9][8] = KE;
	board[9][9] = KY;
	board[8][8] = HI;
	board[8][2] = KA;
	board[7][1] = FU;
	board[7][2] = FU;
	board[7][3] = FU;
	board[7][4] = FU;
	board[7][5] = FU;
	board[7][6] = FU;
	board[7][7] = FU;
	board[7][8] = FU;
	board[7][9] = FU;

	//将棋盤全体（持ち駒もふくむ）を表示する
	showBoard();
};
