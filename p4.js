$(document).ready(function(){

    // changement couleur j1
    $('#pl1').change(function(){
        $('#pl1').css('background-color', $('#pl1').val());
        if ($('#pl1').val() == 'black' || $('#pl1').val() == 'brown' || $('#pl1').val() == 'purple' || $('#pl1').val() == 'blue'){
            $('#pl1').css('color', 'white');
        }
        else{
            $('#pl1').css('color', 'black');
        }
    });

    // changement couleur j2
    $('#pl2').change(function(){
        $('#pl2').css('background-color', $('#pl2').val());
        if ($('#pl2').val() == 'black' || $('#pl2').val() == 'brown' || $('#pl2').val() == 'purple' || $('#pl2').val() == 'blue'){
            $('#pl2').css('color', 'white');
        }
        else{
            $('#pl2').css('color', 'black');
        }
    });

    $('#jouer').click(function(){
        
        $('#p4-form').fadeToggle();

        //création du jeu
        const p4 = new P4('#game');
    
        // définit aléatoirement le joueur qui commence
        var rdm = Math.random();
        if (rdm < 0.5){
            p4.player = p4.player1;
            p4.player_name = p4.player1_name;
        }
        else{
            p4.player = p4.player2;
            p4.player_name = p4.player2_name;
        }

        // affiche le joueur qui doit jouer
        $("#playerTurn").html('Au tour de : '+p4.player_name)
                        .css('color',p4.player);
        if (p4.player == "yellow"){
            $('#playerTurn').css('color','gold');
        }
        
        // code bouton rejouer
        $('#restart').click(function(){
            var choice = confirm("Voulez-vous rejouer ?");
            if (choice){
                $('#restart').css('visibility', 'hidden');
                $('#game').empty();
                if (p4.lastWin == p4.player1){ // si joueur 1 a gagner en dernier alors joueur 2 commence
                    p4.player = p4.player2;
                    p4.player_name = p4.player2_name;
                }
                else if(p4.lastWin == p4.player2){ // si joueur 2 a gagner en dernier alors joueur 1 commence
                    p4.player = p4.player1;
                    p4.player_name = p4.player1_name;
                }
                else{ // sinon aléatoire
                    rdm = Math.random();
                    if (rdm < 0.5){
                        p4.player = p4.player1;
                        p4.player_name = p4.player1_name;
                    }
                    else{
                        p4.player = p4.player2;
                        p4.player_name = p4.player2_name;
                    }
                }
                p4.drawGame();
                $("#playerTurn").html('Au tour de : '+p4.player_name)
                                .css('color',p4.player);
                if (p4.player == "yellow"){
                    $('#playerTurn').css('color','gold');
                }
            }
        });
    
        // code bouton nouvelle partie
        $('#newGame').click(function(){
            var choice = confirm("Nouvelle partie ?");
            if (choice){
                document.location.reload(true);
            } 
        });
    })

});
    
class P4 {
    constructor(selector){
        const couleurs = ['red','yellow','green','blue','purple','pink','brown','black'];

        this.nbjetons = $('#nbjeton').val();
        if(this.nbjetons <=1 || this.nbjetons >8){
            this.nbjetons=4;
        }
        $("#title").html('Puissance '+this.nbjetons)

        this.victoire1 = 0; //initialise les nombre de victoire de joueur 1
        this.victoire2 = 0; //initialise les nombre de victoire de joueur 2

        this.col = $('#col').val();
        if (isNaN(this.col) || this.col==0 || this.col==null || this.col < 0 || this.col > 14){
            this.col=7;
        }
        this.lgn = $('#lgn').val();
        if (isNaN(this.lgn) || this.lgn==0 || this.lgn==null || this.lgn < 0 || this.lgn > 12){
            this.lgn=6;
        } 
        this.player1 = $('#pl1').val(); 
        if (couleurs.indexOf(this.player1)==-1){
            this.player1='red';
        } 
        this.player2 = $('#pl2').val();
        if (couleurs.indexOf(this.player2)==-1 || this.player1==this.player2){
            if (this.player1=='yellow'){
                this.player2='red';
            }
            else{
                this.player2='yellow';
            }
        }
        this.player1_name = $("#pl1-name").val();
        if(this.player1_name==""){
            this.player1_name = this.player1;
        }
        this.player2_name = $("#pl2-name").val();
        if(this.player1_name==this.player2_name || this.player2_name==""){
            this.player2_name = this.player2;
        }
      
        this.selector = selector;

        this.drawGame(); // dessine le jeu
        this.ecoute(); // ecoute les evenements sur le plateau
        this.checkWin(); // cherche si un joueur a gagner
    }
    
    //affiche le plateau
    drawGame(){
        const $game = $(this.selector);
        for(let lgn = 0; lgn < this.lgn; lgn++){
            const $lgn = $('<div>').addClass('lgn');
            for(let col = 0; col < this.col; col++){
                const $col = $('<div>').addClass('col empty').attr("data-col",col).attr("data-lgn", lgn);
                $lgn.append($col);
            }
            $game.append($lgn);
        }
    }

    // ecoute les evenements
    ecoute(){
        const $game = $(this.selector);
        const that = this;

        // retourne la dernière case vide en bas du plateau
        function lastCase(col){ 
            const $cells = $(`.col[data-col='${col}']`);
            for(let i = $cells.length-1; i>=0; i--){
                const $cell = $($cells[i]);
                if($cell.hasClass('empty')){
                    return $cell;
                }
            }
            return null;
        }

        $game.on('mouseenter', '.col.empty', function(){
            const $col = $(this).data('col');
            const $last = lastCase($col);
            
            if($last != null){
                $last.addClass(`p${that.player}`);
            }
        });

        $game.on('mouseleave', '.col', function(){
            $('.col').removeClass(`p${that.player}`);
        });

        $game.on('click','.col.empty', function(){
            const $col = $(this).data('col');
            const $last = lastCase($col);
            $last.addClass(`${that.player}`).removeClass(`empty p${that.player}`).data('player',`${that.player}`);

            const winner = that.checkWin($last.data('lgn'), $last.data('col'));
            
            if(winner){ // si il y a un gagnant
                if(that.player === that.player1){
                    that.victoire1++;
                }
                if(that.player === that.player2){
                    that.victoire2++;
                }
                // dernier joueur ayant gagner
                that.lastWin = that.player;

                $('.col').removeClass('empty');
                alert(`Victoire de ${that.player_name} !`);
                $('#restart').css('visibility', 'visible');
                $('#score1').html("Score "+that.player1_name + " : "+ that.victoire1)
                    .css('color',that.player1);
                    if (that.player1 == "yellow"){
                        $('#score1').css('color','gold');
                    }
                $('#score2').html("Score "+that.player2_name + " : "+ that.victoire2)
                    .css('color',that.player2);
                    if (that.player2 == "yellow"){
                        $('#score2').css('color','gold');
                    }
                $('#separation').css('visibility','visible')
                return;
            }
            else if (! $('.col').hasClass('empty')){ // si il n'y a plus de case jouable ( égalité )
                $('.col').removeClass('empty');
                alert('Egalité !');
                $('#restart').css('visibility', 'visible');
                that.lastWin="egalite";
            }
           
            // change de joueur
            that.player = (that.player === that.player1) ? that.player2 : that.player1;
            that.player_name = (that.player_name === that.player1_name) ? that.player2_name : that.player1_name;
            $("#playerTurn").html('Au tour de : '+that.player_name)
                            .css('color',that.player);
            if (that.player == "yellow"){
                $('#playerTurn').css('color','gold');
            }

        })
    }

    // Verifie si il a une ligne colonne ou diagonale
    checkWin(lgn, col){
        const that = this;

        function getCell(i,j){
            return $(`.col[data-lgn='${i}'][data-col='${j}']`);
        }

        function checkDirection(direction){
            let total = 0;
            let i = lgn + direction.i;
            let j = col + direction.j;
            let $next = getCell(i,j);
            while(i >= 0 && i < that.lgn && j >= 0 && j < that.col && $next.data('player') === that.player){
                total++;
                i += direction.i;
                j += direction.j;
                $next = getCell(i,j);
            }
            return total;
        }

        function checkWin(directionA, directionB){
            const total = 1 + checkDirection(directionA) + checkDirection(directionB);
            if (total>=that.nbjetons){
                return that.player;
            }
            else{
                return null;
            }
        }

        function checkHori(){
            return checkWin({i:0, j:-1}, {i:0, j:1})
        }

        function checkVerti(){
            return checkWin({i:-1, j:0}, {i:1, j:0})
        }

        function checkDiag1(){
            return checkWin({i:1, j:1}, {i:-1, j:-1})
        }

        function checkDiag2(){
            return checkWin({i:1, j:-1}, {i:-1, j:1})
        }

        return checkHori() || checkVerti() || checkDiag1() || checkDiag2();

    }
}
