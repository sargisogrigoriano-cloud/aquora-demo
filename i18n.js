/* Aquora — RU/EN language layer.
   The page is written in English; in RU mode every visible text node is
   translated through AQ_RU (exact match) and AQ_RU_RX (patterns), and a
   MutationObserver keeps newly rendered screens translated. */
(function(){
  var L="en";
  try{
    var u=new URLSearchParams(location.search).get("lang");
    if(u==="ru"||u==="en"){ localStorage.setItem("aq_lang",u); L=u; }
    else { L=localStorage.getItem("aq_lang")||"en"; }
  }catch(e){}
  window.AQ_LANG=L;
  document.documentElement.lang=L;

  function dict(){ return window.AQ_RU||{}; }
  var RX=[
    [/^(\d[\d,.]*)\s?ha$/,"$1 га"],
    [/^(\d[\d,.]*)\s?m³$/,"$1 м³"],
    [/^(\d[\d,.]*)\s?m³\/ha$/,"$1 м³/га"],
    [/^(\d[\d,.]*)\s?m³\/s$/,"$1 м³/с"],
    [/^(\d[\d,.]*)\s?M m³$/,"$1 млн м³"],
    [/^(\d[\d,.]*)\s?k m³$/,"$1 тыс. м³"],
    [/^(\d[\d,.]*)% water$/,"$1% воды"],
    [/^(\d[\d,.]*)% harvest kept$/,"$1% урожая сохранено"],
    [/^(\d[\d,.]*) months?$/,"$1 мес."],
    [/^(\d[\d,.]*)% open$/,"$1% открыт"],
    [/^Water User (\d+)$/,"Водопользователь $1"],
    [/^WUA North · (.*)$/,"АВП «Север» · $1"],
    [/^WUA Central · (.*)$/,"АВП «Центр» · $1"],
    [/^WUA East · (.*)$/,"АВП «Восток» · $1"],
    [/^App function (\d) \/ 7 · Plan$/,"Функция приложения $1 / 7 · План"],
    [/^App function (\d) \/ 7 · Delivery$/,"Функция приложения $1 / 7 · Подача"],
    [/^App function (\d) \/ 7 · Act$/,"Функция приложения $1 / 7 · Акт"],
    [/^App function (\d) \/ 7 · Request$/,"Функция приложения $1 / 7 · Заявка"],
    [/^App function (\d) \/ 7 · Charge$/,"Функция приложения $1 / 7 · Начисление"],
    [/^App function (\d) \/ 7 · Pay$/,"Функция приложения $1 / 7 · Оплата"],
    [/^App function (\d) \/ 7 · (.*)$/,"Функция приложения $1 / 7 · $2"]
  ];
  function tr(s){
    if(L!=="ru"||!s)return s;
    var d=dict(), k=s.trim();
    if(!k)return s;
    var v=d[k];
    if(v===undefined){
      for(var i=0;i<RX.length;i++){ if(RX[i][0].test(k)){ v=k.replace(RX[i][0],RX[i][1]); break; } }
      if(v===undefined){ var vv=(window.AQ_RU_DYN||{})[k]; if(vv!==undefined)v=vv; }
    }
    if(v===undefined||v===k)return s;
    var lead=s.match(/^\s*/)[0], trail=s.match(/\s*$/)[0];
    return lead+v+trail;
  }
  window.aqTr=tr;
  var SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,INPUT:1};
  var busy=false;
  function trText(n){
    var p=n.parentNode; if(!p||SKIP[p.nodeName])return;
    var o=n.nodeValue; if(!o||!/[A-Za-z]/.test(o))return;
    var t=tr(o); if(t!==o){ busy=true; n.nodeValue=t; busy=false; }
  }
  function trAttrs(el){
    ["placeholder","title","aria-label"].forEach(function(a){
      var v=el.getAttribute&&el.getAttribute(a); if(v){ var t=tr(v); if(t!==v)el.setAttribute(a,t); } });
  }
  function trTree(root){
    if(!root)return;
    if(root.nodeType===3){ trText(root); return; }
    if(root.nodeType!==1||SKIP[root.nodeName]&&root.nodeName!=="INPUT")return;
    trAttrs(root);
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT),n;
    while(n=w.nextNode()){ if(n.nodeType===3)trText(n); else trAttrs(n); }
  }
  window.aqTrTree=trTree;

  function start(){
    var sw=document.getElementById("langsw");
    if(sw){
      sw.querySelectorAll("[data-l]").forEach(function(b){
        b.classList.toggle("on",b.getAttribute("data-l")===L);
        b.addEventListener("click",function(e){ e.stopPropagation(); var nl=b.getAttribute("data-l"); if(nl===L)return;
          try{localStorage.setItem("aq_lang",nl);}catch(_){}
          var url=new URL(location.href); url.searchParams.set("lang",nl); location.href=url.toString(); });
      });
    }
    if(L!=="ru")return;
    trTree(document.body);
    new MutationObserver(function(ms){
      if(busy)return;
      ms.forEach(function(m){
        if(m.type==="characterData") trText(m.target);
        else if(m.type==="attributes") trAttrs(m.target);
        else m.addedNodes.forEach(function(n){ trTree(n); });
      });
    }).observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["placeholder","title","aria-label"]});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start); else start();
})();
