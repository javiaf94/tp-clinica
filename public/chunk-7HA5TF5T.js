var ie=typeof window<"u"?window:void 0;var re,yt=t=>{if(re===void 0){let i=t.style.animationName!==void 0,r=t.style.webkitAnimationName!==void 0;re=!i&&r?"-webkit-":""}return re},oe=(t,i,r)=>{let a=i.startsWith("animation")?yt(t):"";t.style.setProperty(a+i,r)},q=(t=[],i)=>{if(i!==void 0){let r=Array.isArray(i)?i:[i];return[...t,...r]}return t},Dt=t=>{let i,r,a,u,_,b,l=[],v=[],Y=[],A=!1,d,$={},K=[],X=[],G={},I=0,W=!1,V=!1,L,T,F,S=!0,M=!1,k=!0,o,D=!1,ce=t,J=[],x=[],N=[],y=[],m=[],le=[],ue=[],de=[],fe=[],me=[],p=[],Pe=typeof AnimationEffect=="function"||ie!==void 0&&typeof ie.AnimationEffect=="function",h=typeof Element=="function"&&typeof Element.prototype.animate=="function"&&Pe,ge=()=>p,Te=e=>(m.forEach(n=>{n.destroy(e)}),Me(e),y.length=0,m.length=0,l.length=0,Oe(),A=!1,k=!0,o),Me=e=>{pe(),e&&We()},ke=()=>{W=!1,V=!1,k=!0,L=void 0,T=void 0,F=void 0,I=0,M=!1,S=!0,D=!1},xe=()=>I!==0&&!D,he=(e,n)=>{let s=n.findIndex(c=>c.c===e);s>-1&&n.splice(s,1)},Re=(e,n)=>(N.push({c:e,o:n}),o),Z=(e,n)=>((n?.oneTimeCallback?x:J).push({c:e,o:n}),o),Oe=()=>(J.length=0,x.length=0,o),pe=()=>{h&&(p.forEach(e=>{e.cancel()}),p.length=0)},We=()=>{le.forEach(e=>{e?.parentNode&&e.parentNode.removeChild(e)}),le.length=0},Ve=e=>(ue.push(e),o),De=e=>(de.push(e),o),Ne=e=>(fe.push(e),o),Ue=e=>(me.push(e),o),je=e=>(v=q(v,e),o),qe=e=>(Y=q(Y,e),o),Be=(e={})=>($=e,o),ze=(e=[])=>{for(let n of e)$[n]="";return o},He=e=>(K=q(K,e),o),Ye=e=>(X=q(X,e),o),$e=(e={})=>(G=e,o),Ke=(e=[])=>{for(let n of e)G[n]="";return o},Q=()=>_!==void 0?_:d?d.getFill():"both",U=()=>L!==void 0?L:b!==void 0?b:d?d.getDirection():"normal",ee=()=>W?"linear":a!==void 0?a:d?d.getEasing():"linear",P=()=>V?0:T!==void 0?T:r!==void 0?r:d?d.getDuration():0,te=()=>u!==void 0?u:d?d.getIterations():1,ne=()=>F!==void 0?F:i!==void 0?i:d?d.getDelay():0,Xe=()=>l,Ge=e=>(b=e,g(!0),o),Je=e=>(_=e,g(!0),o),Ze=e=>(i=e,g(!0),o),Qe=e=>(a=e,g(!0),o),et=e=>(!h&&e===0&&(e=1),r=e,g(!0),o),tt=e=>(u=e,g(!0),o),nt=e=>(d=e,o),it=e=>{if(e!=null)if(e.nodeType===1)y.push(e);else if(e.length>=0)for(let n=0;n<e.length;n++)y.push(e[n]);else console.error("Invalid addElement value");return o},rt=e=>{if(e!=null)if(Array.isArray(e))for(let n of e)n.parent(o),m.push(n);else e.parent(o),m.push(e);return o},ot=e=>{let n=l!==e;return l=e,n&&st(l),o},st=e=>{h&&ge().forEach(n=>{let s=n.effect;if(s.setKeyframes)s.setKeyframes(e);else{let c=new KeyframeEffect(s.target,e,s.getTiming());n.effect=c}})},at=()=>{ue.forEach(c=>c()),de.forEach(c=>c());let e=v,n=Y,s=$;y.forEach(c=>{let f=c.classList;e.forEach(E=>f.add(E)),n.forEach(E=>f.remove(E));for(let E in s)s.hasOwnProperty(E)&&oe(c,E,s[E])})},ct=()=>{fe.forEach(f=>f()),me.forEach(f=>f());let e=S?1:0,n=K,s=X,c=G;y.forEach(f=>{let E=f.classList;n.forEach(w=>E.add(w)),s.forEach(w=>E.remove(w));for(let w in c)c.hasOwnProperty(w)&&oe(f,w,c[w])}),T=void 0,L=void 0,F=void 0,J.forEach(f=>f.c(e,o)),x.forEach(f=>f.c(e,o)),x.length=0,k=!0,S&&(M=!0),S=!0},j=()=>{I!==0&&(I--,I===0&&(ct(),d&&d.animationFinish()))},lt=()=>{y.forEach(e=>{let n=e.animate(l,{id:ce,delay:ne(),duration:P(),easing:ee(),iterations:te(),fill:Q(),direction:U()});n.pause(),p.push(n)}),p.length>0&&(p[0].onfinish=()=>{j()})},Ee=()=>{at(),l.length>0&&h&&lt(),A=!0},R=e=>{e=Math.min(Math.max(e,0),.9999),h&&p.forEach(n=>{n.currentTime=n.effect.getComputedTiming().delay+P()*e,n.pause()})},ye=e=>{p.forEach(n=>{n.effect.updateTiming({delay:ne(),duration:P(),easing:ee(),iterations:te(),fill:Q(),direction:U()})}),e!==void 0&&R(e)},g=(e=!1,n=!0,s)=>(e&&m.forEach(c=>{c.update(e,n,s)}),h&&ye(s),o),ut=(e=!1,n)=>(m.forEach(s=>{s.progressStart(e,n)}),be(),W=e,A||Ee(),g(!1,!0,n),o),dt=e=>(m.forEach(n=>{n.progressStep(e)}),R(e),o),ft=(e,n,s)=>(W=!1,m.forEach(c=>{c.progressEnd(e,n,s)}),s!==void 0&&(T=s),M=!1,S=!0,e===0?(L=U()==="reverse"?"normal":"reverse",L==="reverse"&&(S=!1),h?(g(),R(1-n)):(F=(1-n)*P()*-1,g(!1,!1))):e===1&&(h?(g(),R(n)):(F=n*P()*-1,g(!1,!1))),e!==void 0&&!d&&ve(),o),be=()=>{A&&(h?p.forEach(e=>{e.pause()}):y.forEach(e=>{oe(e,"animation-play-state","paused")}),D=!0)},mt=()=>(m.forEach(e=>{e.pause()}),be(),o),gt=()=>{j()},ht=()=>{p.forEach(e=>{e.play()}),(l.length===0||y.length===0)&&j()},pt=()=>{h&&(R(0),ye())},ve=e=>new Promise(n=>{e?.sync&&(V=!0,Z(()=>V=!1,{oneTimeCallback:!0})),A||Ee(),M&&(pt(),M=!1),k&&(I=m.length+1,k=!1);let s=()=>{he(c,x),n()},c=()=>{he(s,N),n()};Z(c,{oneTimeCallback:!0}),Re(s,{oneTimeCallback:!0}),m.forEach(f=>{f.play()}),h?ht():gt(),D=!1}),Et=()=>{m.forEach(e=>{e.stop()}),A&&(pe(),A=!1),ke(),N.forEach(e=>e.c(0,o)),N.length=0},Ae=(e,n)=>{let s=l[0];return s!==void 0&&(s.offset===void 0||s.offset===0)?s[e]=n:l=[{offset:0,[e]:n},...l],o};return o={parentAnimation:d,elements:y,childAnimations:m,id:ce,animationFinish:j,from:Ae,to:(e,n)=>{let s=l[l.length-1];return s!==void 0&&(s.offset===void 0||s.offset===1)?s[e]=n:l=[...l,{offset:1,[e]:n}],o},fromTo:(e,n,s)=>Ae(e,n).to(e,s),parent:nt,play:ve,pause:mt,stop:Et,destroy:Te,keyframes:ot,addAnimation:rt,addElement:it,update:g,fill:Je,direction:Ge,iterations:tt,duration:et,easing:Qe,delay:Ze,getWebAnimations:ge,getKeyframes:Xe,getFill:Q,getDirection:U,getDelay:ne,getIterations:te,getEasing:ee,getDuration:P,afterAddRead:Ne,afterAddWrite:Ue,afterClearStyles:Ke,afterStyles:$e,afterRemoveClass:Ye,afterAddClass:He,beforeAddRead:Ve,beforeAddWrite:De,beforeClearStyles:ze,beforeStyles:Be,beforeRemoveClass:qe,beforeAddClass:je,onFinish:Z,isRunning:xe,progressStart:ut,progressStep:dt,progressEnd:ft}};var se=class{constructor(){this.m=new Map}reset(i){this.m=new Map(Object.entries(i))}get(i,r){let a=this.m.get(i);return a!==void 0?a:r}getBoolean(i,r=!1){let a=this.m.get(i);return a===void 0?r:typeof a=="string"?a==="true":!!a}getNumber(i,r){let a=parseFloat(this.m.get(i));return isNaN(a)?r!==void 0?r:NaN:a}set(i,r){this.m.set(i,r)}},B=new se;var bt=t=>vt(t),Ut=(t,i)=>(typeof t=="string"&&(i=t,t=void 0),bt(t).includes(i)),vt=(t=window)=>{if(typeof t>"u")return[];t.Ionic=t.Ionic||{};let i=t.Ionic.platforms;return i==null&&(i=t.Ionic.platforms=At(t),i.forEach(r=>t.document.documentElement.classList.add(`plt-${r}`))),i},At=t=>{let i=B.get("platform");return Object.keys(we).filter(r=>{let a=i?.[r];return typeof a=="function"?a(t):we[r](t)})},wt=t=>z(t)&&!_e(t),ae=t=>!!(C(t,/iPad/i)||C(t,/Macintosh/i)&&z(t)),Ct=t=>C(t,/iPhone/i),_t=t=>C(t,/iPhone|iPod/i)||ae(t),Ce=t=>C(t,/android|sink/i),It=t=>Ce(t)&&!C(t,/mobile/i),Lt=t=>{let i=t.innerWidth,r=t.innerHeight,a=Math.min(i,r),u=Math.max(i,r);return a>390&&a<520&&u>620&&u<800},Ft=t=>{let i=t.innerWidth,r=t.innerHeight,a=Math.min(i,r),u=Math.max(i,r);return ae(t)||It(t)||a>460&&a<820&&u>780&&u<1400},z=t=>Mt(t,"(any-pointer:coarse)"),St=t=>!z(t),_e=t=>Ie(t)||Le(t),Ie=t=>!!(t.cordova||t.phonegap||t.PhoneGap),Le=t=>{let i=t.Capacitor;return!!i?.isNative},Pt=t=>C(t,/electron/i),Tt=t=>{var i;return!!(!((i=t.matchMedia)===null||i===void 0)&&i.call(t,"(display-mode: standalone)").matches||t.navigator.standalone)},C=(t,i)=>i.test(t.navigator.userAgent),Mt=(t,i)=>{var r;return(r=t.matchMedia)===null||r===void 0?void 0:r.call(t,i).matches},we={ipad:ae,iphone:Ct,ios:_t,android:Ce,phablet:Lt,tablet:Ft,cordova:Ie,capacitor:Le,electron:Pt,pwa:Tt,mobile:z,mobileweb:wt,desktop:St,hybrid:_e};var Fe=(t,...i)=>console.warn(`[Ionic Warning]: ${t}`,...i);var Bt=(t,i)=>{t.componentOnReady?t.componentOnReady().then(r=>i(r)):kt(()=>i(t))};var kt=t=>typeof __zone_symbol__requestAnimationFrame=="function"?__zone_symbol__requestAnimationFrame(t):typeof requestAnimationFrame=="function"?requestAnimationFrame(t):setTimeout(t);var Kt="ionViewWillEnter",Xt="ionViewDidEnter",Gt="ionViewWillLeave",Jt="ionViewDidLeave",Zt="ionViewWillUnload",O=t=>{t.tabIndex=-1,t.focus()},H=t=>t.offsetParent!==null,xt=()=>({saveViewFocus:r=>{if(B.get("focusManagerPriority",!1)){let u=document.activeElement;u!==null&&r?.contains(u)&&u.setAttribute(Se,"true")}},setViewFocus:r=>{let a=B.get("focusManagerPriority",!1);if(Array.isArray(a)&&!r.contains(document.activeElement)){let u=r.querySelector(`[${Se}]`);if(u&&H(u)){O(u);return}for(let _ of a)switch(_){case"content":let b=r.querySelector('main, [role="main"]');if(b&&H(b)){O(b);return}break;case"heading":let l=r.querySelector('h1, [role="heading"][aria-level="1"]');if(l&&H(l)){O(l);return}break;case"banner":let v=r.querySelector('header, [role="banner"]');if(v&&H(v)){O(v);return}break;default:Fe(`Unrecognized focus manager priority value ${_}`);break}O(r)}}}),Se="ion-last-focus";var Qt=xt();var en=t=>{if(t.classList.contains("ion-page"))return t;let i=t.querySelector(":scope > .ion-page, :scope > ion-nav, :scope > ion-tabs");return i||t};export{Dt as a,bt as b,Ut as c,Bt as d,Kt as e,Xt as f,Gt as g,Jt as h,Zt as i,en as j};