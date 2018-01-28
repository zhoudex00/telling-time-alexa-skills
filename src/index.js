//Code written by Dexin Zhou for Alexa Skills "Telling Time"
//December 2017

//images for Learn mode are from wikiHow
//https://www.wikihow.com/Tell-Time

//clock faces are from The Teacher's Corner
//https://worksheets.theteacherscorner.net/make-your-own/telling-time/

'use strict';
const Alexa = require("alexa-sdk");

//import from moment.js
//https://momentjs.com/
const moment = require('moment');

const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeImage = Alexa.utils.ImageUtils.makeImage;

var GAME_STATES = {
    MATH: "_MATHMODE", // Find duration.
    IDENTIFY1: "_IDENTIFYMODE1", // Given clock, ask for tim.
    IDENTIFY2: "_IDENTIFYMODE2", // Given time, choose clock.
    LEARN: "_LEARNMODE", // Learn
    START: "_STARTMODE", // Entry point, main menu.
    ABOUT: "_ABOUTMODE" // About this Alexa skill.
};

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(newSessionHandlers,startStateHandlers,mathStateHandlers,identifyStateHandlersType1,identifyStateHandlersType2,learnStateHandlers,aboutStateHandlers);
    alexa.execute();
};

const newSessionHandlers = {
    'LaunchRequest': function () {
        this.attributes['displaySupported']=this.event.context.System.device.supportedInterfaces.hasOwnProperty("Display"); //boolean
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame", true);
    },
    'ChooseModeIntent':function(){
        this.attributes['displaySupported']=this.event.context.System.device.supportedInterfaces.hasOwnProperty("Display"); //boolean
        this.handler.state = GAME_STATES.START;
        this.emitWithState("ChooseModeIntent");
    },
    'Unhandled':function(){
        this.emit('LaunchRequest');
    }
};

var startStateHandlers = Alexa.CreateStateHandler(GAME_STATES.START, {
    "StartGame": function (newGame) {
        const builder = new Alexa.templateBuilders.ListTemplate1Builder();
        
            // let template = builder.setTitle('My BodyTemplate1')
            //                       .setBackgroundImage(makeImage('https://upload.wikimedia.org/wikipedia/commons/b/bf/Bee_hummingbird_%28Mellisuga_helenae%29_immature_male.jpg'))
            //                       .setTextContent(makePlainText('agf'))
            //                       .build();
            let template=builder.setTitle('Telling Time! Select a mode:')
            .setListItems(
                [
                    {
                        "token":"option1",
                        "textContent":{
                            "primaryText":makePlainText('Learn mode'),
                            "secondaryText":makePlainText('Learn about telling time.')
                        }
                    },
                {
                    "token":"option2",
                    "textContent":{
                        "primaryText":makePlainText('Identify mode'),
                        "secondaryText":makePlainText('Identify the given time or the given clock.')
                    }
                },
    
                {
                    "token":"option3",
                    "textContent":{
                        "primaryText":makePlainText('Math mode'),
                        "secondaryText":makePlainText('Calculate the duration between the two times.')
                    }
                }
                ]
            )
            .build();
        // let template=builder.setTitle('Clocks!')
        // .setListItems(
        //     [
        //     {
        //         "token":"option1",
        //         "image":makeImage('https://worksheets.theteacherscorner.net/make-your-own/telling-time/clocks/blank_12_numbers_minutes2/1031.png'),
        //         "textContent":{
        //             "primaryText":makePlainText('clock1 w/number')
        //         }
        //     },

        //     {
        //         "token":"option2",
        //         "image":makeImage('https://worksheets.theteacherscorner.net/make-your-own/telling-time/clocks/blank_no_numbers/0108.png'),
        //         "textContent":{
        //             "primaryText":makePlainText('clock2 w/o number')
        //         }
        //     }
        //     ]
        // )
        // .build();

        this.response.speak('Hi there, welcome to Telling Time. What mode would you like to go to? Learn mode, identify mode, or math mode.')
                        .listen('Please select an option. Learn mode, identify mode, or math mode.');
        if(this.attributes['displaySupported']){
            this.response.renderTemplate(template);
        }
        this.emit(':responseReady');
    },

    'ChooseModeIntent':function(){
        var modeSlotValue = this.event.request.intent.slots.mode.value;
       
        if(modeSlotValue=="math" || modeSlotValue=="maths" || modeSlotValue=="mathematics"){        
            this.emitWithState("mathIntro",true);
        }
        else if(modeSlotValue=="identify" || modeSlotValue=="identifying" || modeSlotValue=="identification"){
            this.emitWithState("identifyIntro");
        }
        else if(modeSlotValue=="learn" || modeSlotValue=="learning"){
            this.attributes["learnSlide"]=0;
            this.handler.state = GAME_STATES.LEARN;
            this.emitWithState("learn");
        }
        else if(modeSlotValue=="about"){
            this.handler.state = GAME_STATES.ABOUT;
            this.emitWithState("About");
        }
        else if(modeSlotValue=="menu" || modeSlotValue=="main menu" ||modeSlotValue=="start menu"){
            this.handler.state = GAME_STATES.START;
            this.emitWithState("StartGame");
        }
        else {
            this.handler.state = GAME_STATES.START;
            this.emitWithState("Unhandled");
        }
    },
    "mathIntro":function(){
        this.attributes["mode"]="math";
        this.response.speak('You are in the math mode! If you need to, take out a piece of paper and a pencil to write down the question. Are you ready to begin?')
                    .listen("Are you ready to play math mode? Say yes to continue, or say no to go back.");
        this.emit(':responseReady');
    },
    "identifyIntro":function(){
        this.attributes["mode"]="identify";
        var str;
        if(this.attributes['displaySupported']){
            str='You are in the identify mode! Yes, you are using an Echo Show or Echo Spot. This mode requires an Echo Show or Echo Spot in order to display images. Do you want to continue?';
        }
        else{
            str="You are in the identify mode! No, you are not using an Echo Show or Echo Spot. This mode requires an Echo Show or Echo Spot in order to display images. Do you want to continue?";
        }
        this.response.speak(str)
                 .listen("Are you ready to play identify mode? Say yes to continue, or say no to go back.");
        this.emit(':responseReady');
    },
    "AMAZON.YesIntent":function(){
        if(this.attributes["mode"]=="math"){
            initializeGame.call(this);
            this.handler.state = GAME_STATES.MATH;
            this.emitWithState("startMath");
        }
        else if(this.attributes["mode"]=="identify"){
            initializeGame.call(this);
            this.handler.state = GAME_STATES.IDENTIFY1;
            this.emitWithState("startIdentify");
        }
		else{
			this.emitWithState('Unhandled');
		}
    },
    "AMAZON.NoIntent":function(){
        this.emitWithState("StartGame",true);
    },
    'HelloWorldIntent': function () {
        this.response.speak('Hello! How are you today? Let\'s get started by saying a mode you would like to go.').listen('Say a mode that you would like to go.');
        this.emit(':responseReady');
    },
    "AMAZON.PreviousIntent":function(){
        this.emitWithState("StartGame");
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = 'This is the Telling Time Alexa Skill. From here, you can go to the learn mode, math mode, identify mode, or the about page. Say the mode you want to go.';
        this.response.speak(speechOutput).listen("Please say the mode that you want to go.");
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak('Okay, see you next time!');
        this.emit(':responseReady');
    },
	'AMAZON.CancelIntent':function(){
        this.response.speak('Okay, see you next time!');
        this.emit(':responseReady');
	},
    "AMAZON.RepeatIntent":function(){
        this.emitWithState("StartGame");
    },
	//touch response: under development
    "Display.ElementSelected" : function() {
        if(this.event.request.token=="option1"){
            //console.log("option1 ElemenSelected");
            this.attributes["learnSlide"]=0;
            this.handler.state = GAME_STATES.LEARN;
            this.emitWithState("learn");
        }
        if(this.event.request.token=="option2"){
            this.emitWithState("identifyIntro");
        }
        if(this.event.request.token=="option3"){
            this.emitWithState("mathIntro");
        }
    },
    "Unhandled": function () {
        this.response.speak('Sorry, I don\'t understand your command. To get started, say a mode that you would like to go.').listen("Say the mode that you would like to go.");
        this.emit(':responseReady');
    }
    // 'HelloWorldIntent': function () {
    //     this.emit('SayHello')
    // },
    // 'SayHello': function () {
    //     this.response.speak('Hello World!');
    //     this.emit(':responseReady');
    // }
});


var learnContent=[
    "Welcome to learning to tell time! Say, next, to continue.",
    'Here is a basic clock. A clock ususally has three hands: the second hand, the <phoneme alphabet="ipa" ph="ˈmɪn ɪt">minute</phoneme> hand, and the hour hand. The long and thin one that moves constantly is the second hand. The long and thick one that moves slowly is the <phoneme alphabet="ipa" ph="ˈmɪn ɪt">minute</phoneme> hand. The short one is always the hour hand. <break time="1.5s"/>Did you get it? Say, next, to continue.',
    'When the second hand goes around for a cycle, it is one minute. When the <phoneme alphabet="ipa" ph="ˈmɪn ɪt">minute</phoneme> hand goes around for a cycle, it is one hour. When the hour hand goes around for a cycle, it is 12 hours, or half a day, since a day has 24 hours. <break time="1.5s"/>Did you get it? Say, next, to continue.',
    '60 seconds equals 1 minute. 60 minutes equals 1 hour. 24 hours equals 1 day. When the minutes go over 60, you have to subtract 60 from the minute and add 1 to the hour. That\'s called rounding. Rounding applies to other units, too, like rounding 24 hours into the next day. <break time="1.5s"/>Did you get it? Say, next, to continue.',
    'To tell the hour, look at where is the hour hand. If it is between two number, use the number that is before. If it is precisely pointing the number, it\'s exactly that-o\'clock. <break time="1.5s"/>Did you get it? Say, next, to continue.',
    'To tell the minute, it is quite similar to telling the hour. First, look for the number which the <phoneme alphabet="ipa" ph="ˈmɪn ɪt">minute</phoneme> hand has passed. Multiply that by 5. Then, add the remaining minutes from the number to where the hand is pointing. For example, the image shows that the <phoneme alphabet="ipa" ph="ˈmɪn ɪt">minute</phoneme> hand is between 2 and 3. Multiply 2 times 5, then add 3, so it is 10 plus 3 equals 13 minutes. <break time="1.5s"/>Did you get it? Say, next, to continue.',
    'Lastly, put the word, AM, if it is in the morning. Or use, PM, for afternoon and evening. For example, you would say, 9:45 AM, or equivalently, 9:45 in the morning. That\'s it! Congrats! You just learned to tell time! <break time="1s"/>What would you like to do now? Start over, or go to the main menu?'

];
var learnCard=[
    "Welcome to learning to tell time! Say, next, to continue.",
    'Here is a basic clock. A clock ususally has three hands: the second hand, the minute hand, and the hour hand. The long and thin one that moves constantly is the second hand. The long and thick one that moves slowly is the minute hand. The short one is always the hour hand.',
    'When the second hand goes around for a cycle, it is one minute. When the minute hand goes around for a cycle, it is one hour. When the hour hand goes around for a cycle, it is 12 hours, or half a day, since a day has 24 hours.',
    "60 seconds = 1 minute.  60 minutes = 1 hour.  24 hours = 1 day.  When the minutes go over 60, you have to subtract 60 from the minute and add 1 to the hour. That's called rounding. Rounding applies to other units, too, like rounding 24 hours into the next day.",
    "To tell the hour, look at where is the hour hand. If it is between two number, use the number that is before. If it is precisely pointing the number, it's exactly that-o'clock.",
    'To tell the minute, it is quite similar to telling the hour. First, look for the number which the minute hand has passed. Multiply that by 5. Then, add the remaining minutes from the number to where the hand is pointing. For example: (listen and see the picture)',
    "Use AM if it is in the morning, PM for afternoon and evening. Example: 9:45 AM \nCongrats! You just learned to tell time!"

];
var learnImage=[
    null,
    "https://www.wikihow.com/images/thumb/7/7b/Tell-Time-Step-2-Version-2.jpg/aid254068-v4-728px-Tell-Time-Step-2-Version-2.jpg",
    "https://www.wikihow.com/images/thumb/2/26/Tell-Time-Step-4-Version-2.jpg/aid254068-v4-728px-Tell-Time-Step-4-Version-2.jpg",
    null,
    "https://www.wikihow.com/images/thumb/b/b8/Tell-Time-Step-6-Version-2.jpg/aid254068-v4-728px-Tell-Time-Step-6-Version-2.jpg",
    "https://www.wikihow.com/images/thumb/b/b7/Tell-Time-Step-11.jpg/aid254068-v4-728px-Tell-Time-Step-11.jpg",
    null
];

var learnStateHandlers = Alexa.CreateStateHandler(GAME_STATES.LEARN, {
    
    "learn":function(){
        var learnSlide=this.attributes["learnSlide"];
        var imageObj={
            largeImageUrl:learnImage[learnSlide]
        };
        this.response.speak(learnContent[learnSlide]).listen("Say, next, to continue.");       
        if(learnSlide==1 || learnSlide==2 || learnSlide==4 || learnSlide==5){
            this.response.cardRenderer("Learn",learnCard[learnSlide],imageObj);
        }
        else{
            this.response.cardRenderer("Learn",learnCard[learnSlide],null);
        }
        this.emit(':responseReady');
    },
    "AMAZON.NextIntent":function(){
        if(this.attributes["learnSlide"]<learnContent.length-1){
            this.attributes["learnSlide"] ++;
            this.emitWithState("learn");
        }
        else{
            this.handler.state = GAME_STATES.START;
            this.emitWithState("StartGame");
        }
    },
    "AMAZON.YesIntent":function(){
        this.emitWithState("AMAZON.NextIntent");
    },
    "AMAZON.NoIntent":function(){
        this.emitWithState("AMAZON.RepeatIntent");
    },
    "AMAZON.RepeatIntent":function(){
        this.emitWithState("learn");
    },
    "AMAZON.PreviousIntent":function(){
        if(this.attributes["learnSlide"]>0){
            this.attributes["learnSlide"] --;
            this.emitWithState("learn");
        }
        else{
            this.emitWithState("Unhandled");
        }
    },
    "AMAZON.StartOverIntent":function(){
        this.attributes["learnSlide"]=0;
        this.emitWithState("learn");
    },
    "AMAZON.HelpIntent":function(){
        this.response.speak('You are currently in the learn mode! You can say, next, to continue to the next slide.').listen("Say, next, if you want to continue.");
        this.emit(':responseReady');
    },
    'ChooseModeIntent':function(){
        this.handler.state = GAME_STATES.START;
		this.emitWithState("ChooseModeIntent");
    },
	'AMAZON.StopIntent': function () {
        this.response.speak('Okay, see you next time!');
        this.emit(':responseReady');
    },
	'AMAZON.CancelIntent':function(){
        this.response.speak('Okay, see you next time!');
        this.emit(':responseReady');
	},
    "Unhandled": function () {
        console.log("unhandled");
        this.response.speak("Sorry, I don't understand your answer. Try again.").listen("Try your prompt again.");
        this.emit(':responseReady');
    }
});


var mathStateHandlers = Alexa.CreateStateHandler(GAME_STATES.MATH, {
    
    "startMath":function(){
        var speech="";
        //------abandoned code
        // for(var question=1; question<=2; question ++)
        // {
        // var day1 =new Date(2017,1,1,7,30);
        // var day2 =new Date(2017,1,1,5,13);
        // var daynew =new Date();
        // daynew.setTime(day1.getTime() - day2.getTime());
        // var daystr =daynew.toLocaleTimeString();

        // var duration = moment.duration(7,'d').humanize();

        //this.response.speak('Ready to do some math! '+duration);


        // var currentQuestionIndex=0;
        // var repromptText="again";
        // var correctAnswerIndex=Math.floor(Math.random() * 3);
        // var gameQuestions="question";

        // Object.assign(this.attributes,{
        //     "speechOutput":repromptText,
        //     "repromptText":repromptText,
        //     "currentQuestionIndex":currentQuestionIndex,
        //     "correctAnswerIndex":correctAnswerIndex,
        //     "questions":gameQuestions,
        //     "score":0,
        //     "correctAnswerText":"correct",

        // });

        // if(firstTime){
        //     speech +="Get ready to do some time calculation! ";
        // }
        // if(dontKnow) {
        //     speech +="Don\'t know? Have an another try! ";
        // }


        // var hour1=Math.ceil(Math.random() * 23);
        // var minute1=Math.ceil(Math.random() * 59);
        // var durmin=Math.ceil(Math.random()*719);

        // var time1=moment(new Date(2017,1,1,hour1,minute1));
        // var dur=moment.duration(durmin,'minutes');
        // var time2=moment(time1).add(dur);
        // gameData.time1=time1;
        // gameData.durmin=durmin;
        
        // var durminstr=Math.floor(durmin/60) +" hours "+(durmin%60) +" minutes";

        if(this.attributes["newGame"]===true)
        {
            populateMathQ.call(this);
        }
        this.attributes["newGame"]=true;

        var time1=this.attributes["startTime"];
        var time2=this.attributes["endTime"];
        var durminstr=this.attributes["durminstr"];

        if(this.attributes["forgotUnit"]){
            speech +="Oops, you didn\'t put the time unit, like, hours and minutes. ";
        }
        if(this.attributes["lastQ"]==-1 && !this.attributes["forgotUnit"])
        {
            speech +="Try another question. Say, help, if you need some help. ";
        }
        else if(!this.attributes["forgotUnit"]){
            speech +="Okay. ";
        }
        else{
            speech +="Try again. ";
        }
        this.attributes["forgotUnit"]=false;
        
        speech +="Calculate the duration between ";
        speech +=(moment(time1).format('LT') + ", and, " +moment(time2).format('LT') +".");
        //Show answer:
        //speech += "DURATION is " +durminstr;
        this.response.speak(speech)
                    .listen("Answer the question with a duration. Say, repeat, to hear the question again.").cardRenderer("Question:",speech,null);
        this.emit(':responseReady');
        
    },
    "AnswerDuration":function(){
        var str="";
        var cardTitle="";
        var cardStr="";
        if(this.event.request.intent.slots.Answer.value == moment.duration(this.attributes["duration"],'minutes').toISOString())    
        {
            this.attributes["score"] +=1;
            this.attributes["lastQ"]=1;
            str="Correct! You got "+this.attributes["score"] +" questions correct in a row. Great job. Do you want to try an another problem?";
            cardTitle="Correct!";
            cardStr="You got "+this.attributes["score"] +" questions correct in a row.";
        }
    
        else {
            this.attributes["score"]=0;
            this.attributes["lastQ"]=-1;
            str="Sorry, that\'s incorrect! The answer is: ";
            str +=this.attributes["durminstr"];
            str +=". Would you like to keep playing?";
            cardTitle="Incorrect!";
            cardStr="The answer is: "+this.attributes["durminstr"];
        }
        this.response.speak(str).listen("Do you want to try an another problem?").cardRenderer(cardTitle,cardStr,null);
        this.emit(':responseReady');
    },
    "AnswerOption":function(){
        this.attributes["forgotUnit"]=true;
        this.attributes["newGame"]=false;
        this.emitWithState("startMath");
    },
    "DontKnowIntent":function(){
        this.attributes["score"]=0;
        this.attributes["lastQ"]=-1;
        this.emitWithState("startMath");
    },
    "AMAZON.YesIntent":function(){
        this.emitWithState("startMath");
    },
    "AMAZON.NoIntent":function(){
        this.response.speak('Okay, see you next time!');
        this.emit(':responseReady');
    },
    "AMAZON.StartOverIntent":function(){
        this.attributes["score"]=0;
        this.emitWithState("startMath");
    },
    "AMAZON.HelpIntent":function(){
        this.attributes["newGame"]=false;
        this.response.speak("This problem is asking you to find the duration, or the difference, between the two given time. Remember, you can go back and learn about telling time by saying, learn. Now, do you want to continue playing?")
                    .listen("Do you want to continue playing? Say yes to continue, say learn to learn, or say no to quit.");
        this.emit(':responseReady');
    },
    "AMAZON.RepeatIntent":function(){
        this.attributes["newGame"]=false;
        this.emitWithState("startMath");
    },
    "AMAZON.StopIntent":function(){
        pauseGame.call(this);
    },
	'AMAZON.CancelIntent':function(){
		pauseGame.call(this);
	},
	"AMAZON.PauseIntent":function(){
        pauseGame.call(this);
    },
    "AMAZON.ResumeIntent":function(){
		this.attributes["newGame"]=false;
        this.emitWithState("startMath");
    },
    'ChooseModeIntent':function(){
        this.handler.state = GAME_STATES.START;
		this.emitWithState("ChooseModeIntent");
    },
	"AMAZON.PreviousIntent":function(){
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame");
    },
    "Unhandled": function () {
        this.response.speak('Sorry, I don\'t understand your answer. Try again.').listen("Try your prompt again.");
        this.emit(':responseReady');
    }
});

function pauseGame(){
	this.attributes["newGame"]=false;
    this.response.speak("Game stopped. Say yes when you are ready again.")
                .listen("Say yes to continue playing, or say no to quit.");
    this.emit(':responseReady');
}

function populateMathQ(){
    var hour1=Math.floor(Math.random() * 24);
    var minute1=Math.floor(Math.random() * 60);
    var durmin=Math.floor(Math.random()*720);

    var time1=moment(new Date(2017,0,1,hour1,minute1));
    var dur=moment.duration(durmin,'minutes');
    var time2=moment(time1).add(dur);
    
    var durminstr=Math.floor(durmin/60) +" hours "+(durmin%60) +" minutes";
    Object.assign(this.attributes,{
        "startTime":time1,
        "duration":durmin,
        "endTime":time2,
        "durminstr":durminstr
    });
}

function populateIdentifyQ(){
    //var questionType=Math.floor(Math.random()*2)+1;  //1=say the time, 2=choose between three
    var time=moment("2017-1-1").add(moment.duration(Math.floor(Math.random()*720),'minutes'));
    var wrong1=moment("2017-1-1").add(moment.duration(Math.floor(Math.random()*720),'minutes'));
    var wrong2=moment("2017-1-1").add(moment.duration(Math.floor(Math.random()*720),'minutes'));

    //this.attributes["QType"]=questionType;
    this.attributes["time"]=time;
    this.attributes["wrong1"]=wrong1;
    this.attributes["wrong2"]=wrong2;

    var correct=Math.floor(Math.random()*3)+1; //1,2,3
    var wrong1Loc=correct;
    var wrong2Loc=wrong1Loc;
   while(wrong1Loc==correct){
       wrong1Loc=Math.floor(Math.random()*3)+1;
   }
   while(wrong2Loc==correct || wrong2Loc==wrong1Loc){
       wrong2Loc=Math.floor(Math.random()*3)+1;
   }
    var array=[];
    array[correct]=time;
    array[wrong1Loc]=wrong1;
    array[wrong2Loc]=wrong2;
    this.attributes["correct"]=correct;
    this.attributes["optionArray"]=array;
}

function initializeGame(){
    Object.assign(this.attributes,{
        "score":0,  //1=correct, -1=wrong/guess
        "lastQ":0,
        "newGame":true,
        "forgotUnit":false
    });
}

var identifyStateHandlersType1 = Alexa.CreateStateHandler(GAME_STATES.IDENTIFY1, {
    "startIdentify":function(){
        var speech="";

        if(this.attributes["newGame"]===true)
        {
            populateIdentifyQ.call(this);
        }
        this.attributes["newGame"]=true;

        var time1=this.attributes["time"];
        //var QType=this.attributes["QType"];
        var wrong1=this.attributes["wrong1"];
        var wrong2=this.attributes["wrong2"];

        if(this.attributes["lastQ"]==-1)
        {
            speech +="Try another question. Say, help, if you need some help. ";
        }
        else{
            speech +="Okay. ";
        }

        var template=null;

        //if(QType==1){
            speech +="What is the time on the clock on the screen?";
            const builder = new Alexa.templateBuilders.BodyTemplate7Builder();
            var url="https://worksheets.theteacherscorner.net/make-your-own/telling-time/clocks/blank_12_numbers_minutes2/" +moment(time1).format('hhmm') +".png";
            template=builder.setTitle('Say the time on the clock!')
            .setImage(
                makeImage(url)
            )
            .build();
       
        this.response.speak(speech).listen("Please answer with the hour and the minute.");
        if(this.attributes['displaySupported']){
            this.response.renderTemplate(template);
        }
        this.emit(':responseReady');
    },

    "AnswerTime":function(){
        var isCorrect=checkTimeAnswer.call(this,1);
        AnswerReply.call(this,isCorrect);
    },
    "AnswerOption":function(){
        var isCorrect=checkTimeAnswer.call(this,2);
        AnswerReply.call(this,isCorrect);
    },
    "DontKnowIntent":function(){
        this.attributes["score"]=0;
        this.attributes["lastQ"]=-1;
        this.handler.state = GAME_STATES.IDENTIFY2;
        this.emitWithState("startIdentify");
    },
    "AMAZON.YesIntent":function(){
        if(this.attributes["newGame"]==true){
            this.handler.state = GAME_STATES.IDENTIFY2;
            this.emitWithState("startIdentify");
        }
        else{
            this.emitWithState("startIdentify");
        }
    },
    "AMAZON.NoIntent":function(){
        this.response.speak('See you later!');
        this.emit(':responseReady');
    },
    "AMAZON.StartOverIntent":function(){
        this.attributes["score"]=0;
        this.handler.state = GAME_STATES.IDENTIFY2;
            this.emitWithState("startIdentify");
    },
    "AMAZON.HelpIntent":function(){
        this.attributes["newGame"]=false;
        var speech="This problem is asking you to identify the time on the clock. Answer with the hour and the minute. Remember, you can go back and learn about telling time by saying, learn. Now, do you want to continue playing?";
        
        this.response.speak(speech)
                    .listen("Do you want to continue playing? Say yes to continue, or no to quit.");
        this.emit(':responseReady');
    },
    "AMAZON.RepeatIntent":function(){
        this.attributes["newGame"]=false;
        this.emitWithState("startIdentify");
    },
    "AMAZON.StopIntent":function(){
        pauseGame.call(this);
    },
	'AMAZON.CancelIntent':function(){
		pauseGame.call(this);
	},
	"AMAZON.PauseIntent":function(){
        pauseGame.call(this);
    },
    "AMAZON.ResumeIntent":function(){
		this.attributes["newGame"]=false;
        this.emitWithState("startIdentify");
    },
    'ChooseModeIntent':function(){
        this.handler.state = GAME_STATES.START;
		this.emitWithState("ChooseModeIntent");
    },
	"AMAZON.PreviousIntent":function(){
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame");
    },
    "Unhandled": function () {
        this.response.speak('Sorry, I don\'t understand your answer. Try again.').listen("Try your prompt again.");
        this.emit(':responseReady');
    }
});

function AnswerReply(isCorrect){
    var str="";
	var cardTitle;
	var cardStr;
	if(isCorrect){
		this.attributes["score"] +=1;
		this.attributes["lastQ"]=1;

		str +="Correct. You got "+this.attributes["score"] +" questions correct in a row. Great job! Do you want to try an another problem?";
		cardTitle="Correct!";
		cardStr="You got "+this.attributes["score"] +" questions correct in a row.";
			
	}
	else{
		this.attributes["score"] =0;
		this.attributes["lastQ"]=-1;

		str +="Sorry, that\'s incorrect. The correct answer is ";
		str +=moment(this.attributes["time"]).format('LT');
		str +=". Would you like to try an another question?";
		cardTitle="Incorrect!";
		cardStr="The answer is: "+moment(this.attributes["time"]).format('LT');
	}
   
	this.response.speak(str).listen("Would you like to try an another question? Say yes to keep playing, or say no to quit.").cardRenderer(cardTitle,cardStr,null);
	this.emit(':responseReady');
}


var identifyStateHandlersType2 = Alexa.CreateStateHandler(GAME_STATES.IDENTIFY2, {
    "startIdentify":function(){
        var speech="";

        if(this.attributes["newGame"]===true)
        {
            populateIdentifyQ.call(this);
        }
        this.attributes["newGame"]=true;

        var time1=this.attributes["time"];
        //var QType=this.attributes["QType"];
        var wrong1=this.attributes["wrong1"];
        var wrong2=this.attributes["wrong2"];

        if(this.attributes["lastQ"]==-1)
        {
            speech +="Try another question. Say, help, if you need some help. ";
        }
        else{
            speech +="Okay. ";
        }

        var template=null;

            speech +="Choose the clock face for "+moment(time1).format('LT')+". Say the option number.";

            var optionArray=this.attributes["optionArray"];

            const builder = new Alexa.templateBuilders.ListTemplate2Builder();

            template=builder.setTitle('Choose the clock face for '+moment(time1).format('LT')+'!')
            .setListItems(
            [
            {
                "token":"option1",
                "image":makeImage('https://worksheets.theteacherscorner.net/make-your-own/telling-time/clocks/blank_12_numbers_minutes2/'+moment(optionArray[1]).format('hhmm')+'.png'),
                "textContent":{
                    "primaryText":makePlainText('Option 1')
                }
            },
    
            {
                "token":"option2",
                "image":makeImage('https://worksheets.theteacherscorner.net/make-your-own/telling-time/clocks/blank_12_numbers_minutes2/'+moment(optionArray[2]).format('hhmm')+'.png'),
                "textContent":{
                    "primaryText":makePlainText('Option 2')
                }
            },

            {
                "token":"option3",
                "image":makeImage('https://worksheets.theteacherscorner.net/make-your-own/telling-time/clocks/blank_12_numbers_minutes2/'+moment(optionArray[3]).format('hhmm')+'.png'),
                "textContent":{
                    "primaryText":makePlainText('Option 3')
                }
            }
            ]
        )
        .build();
        
        this.response.speak(speech).listen("Please answer the question with the option number, like, option 2.");
        if(this.attributes['displaySupported']){
            this.response.renderTemplate(template);
        }
        this.emit(':responseReady');
    },

    
    "AnswerOption":function(){
        var isCorrect=checkOptionAnswer.call(this);

        var str="";
        var cardTitle;
        var cardStr;
        if(isCorrect){
            this.attributes["score"] +=1;
            this.attributes["lastQ"]=1;

            str +="Correct. You got "+this.attributes["score"] +" questions correct in a row. Great job! Do you want to try an another problem?";
            cardTitle="Correct!";
            cardStr="You got "+this.attributes["score"] +" questions correct in a row.";        
        }
        else{
            this.attributes["score"] =0;
            this.attributes["lastQ"]=-1;

            str +="Sorry, that\'s incorrect. The correct answer is option ";
            str +=this.attributes["correct"];
            str +=". Would you like to keep playing?";
            cardTitle="Incorrect!";
            cardStr="The answer is: option "+this.attributes["correct"];
        }
        this.response.speak(str).listen("Would you like to keep playing? Say yes to keep playing, or say no to quit.").cardRenderer(cardTitle,cardStr,null);
        this.emit(':responseReady');
    },
    "DontKnowIntent":function(){
        this.attributes["score"]=0;
        this.attributes["lastQ"]=-1;
        this.handler.state = GAME_STATES.IDENTIFY1;
            this.emitWithState("startIdentify");
    },
    "AMAZON.YesIntent":function(){
        if(this.attributes["newGame"]==true){
            this.handler.state = GAME_STATES.IDENTIFY1;
            this.emitWithState("startIdentify");
        }
        else{
            this.emitWithState("startIdentify");
        }
    },
    "AMAZON.NoIntent":function(){
        this.response.speak('See you later!');
        this.emit(':responseReady');
    },
    "AMAZON.StartOverIntent":function(){
        this.attributes["score"]=0;
        this.handler.state = GAME_STATES.IDENTIFY1;
            this.emitWithState("startIdentify");
    },
    "AMAZON.HelpIntent":function(){
        this.attributes["newGame"]=false;
        
            var speech="This problem is asking you to identify the correct clock face for the given time. Answer the question with the choice number, like, option one, or, option two. Remember, you can go back and learn about telling time by saying, learn. Now, do you want to continue playing?";
        
        this.response.speak(speech)
                    .listen("Do you want to continue playing? Say yes to continue, or no to quit.");
        this.emit(':responseReady');
    },
    "AMAZON.RepeatIntent":function(){
        this.attributes["newGame"]=false;
        this.emitWithState("startIdentify");
    },
    "AMAZON.StopIntent":function(){
        pauseGame.call(this);
    },
	'AMAZON.CancelIntent':function(){
		pauseGame.call(this);
	},
	"AMAZON.PauseIntent":function(){
        pauseGame.call(this);
    },
    "AMAZON.ResumeIntent":function(){
		this.attributes["newGame"]=false;
        this.emitWithState("startIdentify");
    },
    'ChooseModeIntent':function(){
        this.handler.state = GAME_STATES.START;
		this.emitWithState("ChooseModeIntent");
    },
	"AMAZON.PreviousIntent":function(){
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame");
    },
    "Unhandled": function () {
        this.response.speak('Sorry, I don\'t understand your answer. Try again.').listen("Try your prompt again.");
        this.emit(':responseReady');
    }
});

function checkOptionAnswer(){

    var correctLoc=this.attributes["correct"];
    var userOptionAnswer=this.event.request.intent.slots.Option.value;

    if(correctLoc==parseInt(userOptionAnswer)){
        return true;
    }
    else{
        return false;}
}
function checkTimeAnswer(inputType){
    var time1=this.attributes["time"];
    //Types: 1=from AnswerTime, 2=from AnswerOption
    if(inputType==1){
        var userTimeAnswer=this.event.request.intent.slots.Time.value;
    }
    else if(inputType==2){
        var input=parseInt(this.event.request.intent.slots.Option.value);
        if(input>=1200){
            var userTimeAnswer=moment("0"+(input-1200),"hmm").format("HH:mm");
        }
        else{
        var userTimeAnswer=moment(input.toString(),"hmm").format("HH:mm");
        }
    }
    if(moment(time1).diff(moment("2017-01-01 "+userTimeAnswer))==0){
        return true;
    }
    else{
        return false;}
}

var aboutStateHandlers = Alexa.CreateStateHandler(GAME_STATES.ABOUT, {
    "About":function(){
        this.response.speak('This Alexa skill is developed by Dexin Zhou in December 2017. The images for the learn mode are from wikihow.com. Thank you for using this skill. Say anything to go back to the menu.').listen("Say anything to go back.");
        this.emit(':responseReady');
    },
    "Unhandled":function(){
        this.handler.state = GAME_STATES.START;
        this.emitWithState("StartGame");
    }
});