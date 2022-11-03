class WordQuiz {
    constructor(rootElm) {
      this.rootElm = rootElm;
      // ゲームのステータス
      this.gameStatus = {};
      this.resetGame();
      }
    //init関数が呼ばれる、①けど非同期でfetchQuizData関数が実行
    //①が終わったら⓶のdisplayStartView関数が実行
    async init() {
      await this.fetchQuizData();
      this.displayStartView();
    }
  
    async fetchQuizData() {
      //非同期でQuiz.jsonを取得し、非同期で取得データをjson関数で実行しquizDataとする
      try {
        const response = await fetch('quiz.json');
        this.quizData = await response.json();
      } catch (e) {
        this.rootElm.innerText = '問題の読み込みに失敗しました';
        console.log(e);
      }
    }
    
    isLastStep(){
        //現在表示している設問が最後の設問か否かを判断するメソッド
        //gameStatusのstepプロパティの値と設問数を比較している
        const currentQuestions = this.quizData[this.gameStatus.level];
        return this.gameStatus.step === Object.keys(currentQuestions).length;
    }

    nextStep() {
        this.addResult();
        if(this.isLastStep()) {
            this.displayResultView();//ゲーム終了画面へ
        } else {
            this.gameStatus.step++;
            this.displayQuestionView();//次のゲームを選択
        }
    }

    addResult(){
        //画面に表示されているchoiceのラジオボタンからチェックされているElement（要素）を取得
        const checkedElm = this.rootElm.querySelector('input[name="choice"]:checked');
        //その値（checkedElm）をanswer変数に格納する。偽（選択されていない）の時は空の文字列が入る
        const answer = checkedElm ? checkedElm.value : '';
        const currentQuestion = this.quizData[this.gameStatus.level][`step${this.gameStatus.step}`];
        //gameStatus.results配列に追加していく
        this.gameStatus.results.push({
            question: currentQuestion,
            selectedAnswer: answer
        });

        console.log(`解答結果：${answer}`);
    }

    calcScore(){
        let correctNum = 0;//letは変数（変化していく）
        const results = this.gameStatus.results;
        //gameStatus.resultsプロパティ内の解答情報オブジェクトから
        //解答と正解を取得し、正解した数だけcorrectNumの値を増やしていく
        for(const result of results){
            const selected = result.selectedAnswer;
            const correct = result.question.answer;
            if(selected === correct){
                correctNum++;
            }
        }
        //Math.floorは小数点以下切捨ての整数値へ
        return Math.floor((correctNum / results.length) * 100);
    }

    resetGame(){
        //ゲームリセットの際の初期化
        this.gameStatus.level = null;
        this.gameStatus.step = 1;
        this.gameStatus.results = [];//解答結果も初期化
    }
  
    displayStartView() {
      //Object.keysメソッドによりquizDataのキーを配列として取り出す
      const levelStrs = Object.keys(this.quizData);
      this.gameStatus.level = levelStrs[0];
      //optionStrsの配列を用意、しかも空
      const optionStrs = [];
      //levelStrs配列の長さ（数）まで繰り返す。0,1,2(level1,level2,level3の３つ)
      for (let i = 0; i < levelStrs.length; i++) {
        //空のoptionStrs配列にlevelStrs[i]（i番目）をpush(格納)する
        optionStrs.push(`<option value="${levelStrs[i]}" name="level">レベル${i + 1}</option>`);
      }
  
      const html = `
        <select class="levelSelector">
          ${optionStrs.join('')}
        </select>
        <button class="startBtn">スタート</button>
      `;
      //divタグを親要素とする
      const parentElm = document.createElement('div');
      //innnerHTMLはＨＴＭｌのテキストや画像をタグごと書き替えたい時
      parentElm.innerHTML = html;
      const selectorElm = parentElm.querySelector('.levelSelector');
      selectorElm.addEventListener('change', (event) => {
        this.gameStatus.level = event.target.value;
      });
      //スタートボタンを定義する（親要素に対してquerySelector実行
      const startBtnElm = parentElm.querySelector('.startBtn');
      //新ボタンをクリックするとdisplayQuestionView関数が呼ばれる
      startBtnElm.addEventListener('click', () => {
        this.displayQuestionView();
      });
  
      this.replaceView(parentElm);
    }
  
    displayQuestionView() {
      console.log(`選択中のレベル:${this.gameStatus.level}`);
      const stepKey = `step${this.gameStatus.step}`; // --- [2]
      const currentQuestion = this.quizData[this.gameStatus.level][stepKey];
      
      const choiceStrs = [];
      for (const choice of currentQuestion.choices) {
        choiceStrs.push(`<label>
                            <input type="radio" name="choice" value="${choice}" />
                            ${choice}
                          </label>`);
      }
  
      const html = ` 
        <p>${currentQuestion.word}</p>
        <div>
          ${choiceStrs.join('')}
        </div>
        <div class="actions">
          <button class="nextBtn">解答する</button>
        </div>
      `;
  
      const parentElm = document.createElement('div');
      parentElm.className = 'question';
      parentElm.innerHTML = html;
  
      const nextBtnElm = parentElm.querySelector('.nextBtn'); 
      nextBtnElm.addEventListener('click', () => {
        this.nextStep();
      }); 
  
      this.replaceView(parentElm);
    }
  
    displayResultView() {
      const score = this.calcScore();  
      const html = `
        <h2>ゲーム終了</h2>
        <p>正答率：${score}%</p>
        <button class="resetBtn">開始画面に戻る</button>
      `;
  
      const parentElm = document.createElement('div');
      parentElm.className = 'results';
      parentElm.innerHTML = html;
  
      const resetBtnElm = parentElm.querySelector('.resetBtn');
      resetBtnElm.addEventListener('click', () => {
        this.resetGame();
        this.displayStartView();
      });
  
      this.replaceView(parentElm);
    }
    //replace関数：各画面が切り替わる際に今表示している内容をすべて消して、
    //新しい要素をセットする
    replaceView(elm) {
      this.rootElm.innerHTML = '';
      this.rootElm.appendChild(elm);
    }
  }
  
  new WordQuiz(document.getElementById('app')).init();
