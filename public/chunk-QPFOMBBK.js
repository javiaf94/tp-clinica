import{c as F}from"./chunk-MWVCMFOE.js";import{a as T}from"./chunk-MM5QLNJM.js";import{b as C,f as D,g as I,h as R,k as y}from"./chunk-H3GX5QFY.js";import{a as w}from"./chunk-OBXDPQ3V.js";import{a as L,d as k}from"./chunk-GNTYDZC5.js";import{b as c}from"./chunk-MCRJI3T3.js";import{a as f,c as A}from"./chunk-L3TIC5CR.js";import{h as u}from"./chunk-YDOXD4O3.js";var v='[tabindex]:not([tabindex^="-"]):not([hidden]):not([disabled]), input:not([type=hidden]):not([tabindex^="-"]):not([hidden]):not([disabled]), textarea:not([tabindex^="-"]):not([hidden]):not([disabled]), button:not([tabindex^="-"]):not([hidden]):not([disabled]), select:not([tabindex^="-"]):not([hidden]):not([disabled]), .ion-focusable:not([tabindex^="-"]):not([hidden]):not([disabled]), .ion-focusable[disabled="false"]:not([tabindex^="-"]):not([hidden])',x=(e,n)=>{let t=e.querySelector(v);_(t,n??e)},P=(e,n)=>{let t=Array.from(e.querySelectorAll(v)),o=t.length>0?t[t.length-1]:null;_(o,n??e)},_=(e,n)=>{let t=e,o=e?.shadowRoot;o&&(t=o.querySelector(v)||e),t?y(t):n.focus()},E=0,M=0,g=new WeakMap,h=e=>({create(t){return W(e,t)},dismiss(t,o,i){return $(document,t,o,e,i)},getTop(){return u(this,null,function*(){return p(document,e)})}}),ue=h("ion-alert"),me=h("ion-action-sheet");var fe=h("ion-modal");var pe=h("ion-popover");var ve=e=>{typeof document<"u"&&H(document);let n=E++;e.overlayIndex=n},ge=e=>(e.hasAttribute("id")||(e.id=`ion-overlay-${++M}`),e.id),W=(e,n)=>typeof window<"u"&&typeof window.customElements<"u"?window.customElements.whenDefined(e).then(()=>{let t=document.createElement(e);return t.classList.add("overlay-hidden"),Object.assign(t,Object.assign(Object.assign({},n),{hasController:!0})),q(document).appendChild(t),new Promise(o=>C(t,o))}):Promise.resolve(),K=e=>e.classList.contains("overlay-hidden"),N=(e,n)=>{let t=e,o=e?.shadowRoot;o&&(t=o.querySelector(v)||e),t?y(t):n.focus()},Y=(e,n)=>{let t=p(n,"ion-alert,ion-action-sheet,ion-loading,ion-modal,ion-picker-legacy,ion-popover"),o=e.target;if(!t||!o||t.classList.contains(ne))return;let i=()=>{if(t===o)t.lastFocus=void 0;else if(o.tagName==="ION-TOAST")N(t.lastFocus,t);else{let a=R(t);if(!a.contains(o))return;let s=a.querySelector(".ion-overlay-wrapper");if(!s)return;if(s.contains(o)||o===a.querySelector("ion-backdrop"))t.lastFocus=o;else{let d=t.lastFocus;x(s,t),d===n.activeElement&&P(s,t),t.lastFocus=n.activeElement}}},r=()=>{if(t.contains(o))t.lastFocus=o;else if(o.tagName==="ION-TOAST")N(t.lastFocus,t);else{let a=t.lastFocus;x(t),a===n.activeElement&&P(t),t.lastFocus=n.activeElement}};t.shadowRoot?r():i()},H=e=>{E===0&&(E=1,e.addEventListener("focus",n=>{Y(n,e)},!0),e.addEventListener("ionBackButton",n=>{let t=p(e);t?.backdropDismiss&&n.detail.register(k,()=>{t.dismiss(void 0,S)})}),L()||e.addEventListener("keydown",n=>{if(n.key==="Escape"){let t=p(e);t?.backdropDismiss&&t.dismiss(void 0,S)}}))},$=(e,n,t,o,i)=>{let r=p(e,o,i);return r?r.dismiss(n,t):Promise.reject("overlay does not exist")},z=(e,n)=>(n===void 0&&(n="ion-alert,ion-action-sheet,ion-loading,ion-modal,ion-picker-legacy,ion-popover,ion-toast"),Array.from(e.querySelectorAll(n)).filter(t=>t.overlayIndex>0)),O=(e,n)=>z(e,n).filter(t=>!K(t)),p=(e,n,t)=>{let o=O(e,n);return t===void 0?o[o.length-1]:o.find(i=>i.id===t)},B=(e=!1)=>{let t=q(document).querySelector("ion-router-outlet, ion-nav, #ion-view-container-root");t&&(e?t.setAttribute("aria-hidden","true"):t.removeAttribute("aria-hidden"))},he=(e,n,t,o,i)=>u(void 0,null,function*(){var r,a;if(e.presented)return;e.el.tagName!=="ION-TOAST"&&B(!0),document.body.classList.add(w),ee(e.el),j(e.el),e.presented=!0,e.willPresent.emit(),(r=e.willPresentShorthand)===null||r===void 0||r.emit();let s=A(e),d=e.enterAnimation?e.enterAnimation:f.get(n,s==="ios"?t:o);(yield V(e,d,e.el,i))&&(e.didPresent.emit(),(a=e.didPresentShorthand)===null||a===void 0||a.emit()),e.el.tagName!=="ION-TOAST"&&Q(e.el),e.keyboardClose&&(document.activeElement===null||!e.el.contains(document.activeElement))&&e.el.focus(),e.el.removeAttribute("aria-hidden")}),Q=e=>u(void 0,null,function*(){let n=document.activeElement;if(!n)return;let t=n?.shadowRoot;t&&(n=t.querySelector(v)||n),yield e.onDidDismiss(),(document.activeElement===null||document.activeElement===document.body)&&n.focus()}),Oe=(e,n,t,o,i,r,a)=>u(void 0,null,function*(){var s,d;if(!e.presented)return!1;let l=c!==void 0?O(c).filter(m=>m.tagName!=="ION-TOAST"):[];l.length===1&&l[0].id===e.el.id&&(B(!1),document.body.classList.remove(w)),e.presented=!1;try{j(e.el),e.el.style.setProperty("pointer-events","none"),e.willDismiss.emit({data:n,role:t}),(s=e.willDismissShorthand)===null||s===void 0||s.emit({data:n,role:t});let m=A(e),U=e.leaveAnimation?e.leaveAnimation:f.get(o,m==="ios"?i:r);t!==Z&&(yield V(e,U,e.el,a)),e.didDismiss.emit({data:n,role:t}),(d=e.didDismissShorthand)===null||d===void 0||d.emit({data:n,role:t}),(g.get(e)||[]).forEach(G=>G.destroy()),g.delete(e),e.el.classList.add("overlay-hidden"),e.el.style.removeProperty("pointer-events"),e.el.lastFocus!==void 0&&(e.el.lastFocus=void 0)}catch(m){console.error(m)}return e.el.remove(),te(),!0}),q=e=>e.querySelector("ion-app")||e.body,V=(e,n,t,o)=>u(void 0,null,function*(){t.classList.remove("overlay-hidden");let i=e.el,r=n(i,o);(!e.animated||!f.getBoolean("animated",!0))&&r.duration(0),e.keyboardClose&&r.beforeAddWrite(()=>{let s=t.ownerDocument.activeElement;s?.matches("input,ion-input, ion-textarea")&&s.blur()});let a=g.get(e)||[];return g.set(e,[...a,r]),yield r.play(),!0}),be=(e,n)=>{let t,o=new Promise(i=>t=i);return J(e,n,i=>{t(i.detail)}),o},J=(e,n,t)=>{let o=i=>{I(e,n,o),t(i)};D(e,n,o)},ye=e=>e==="cancel"||e===S,X=e=>e(),we=(e,n)=>{if(typeof e=="function")return f.get("_zoneGate",X)(()=>{try{return e(n)}catch(o){throw o}})},S="backdrop",Z="gesture",Ae=39,Ee=e=>{let n=!1,t,o=F(),i=(s=!1)=>{if(t&&!s)return{delegate:t,inline:n};let{el:d,hasController:l,delegate:b}=e;return n=d.parentNode!==null&&!l,t=n?b||o:b,{inline:n,delegate:t}};return{attachViewToDom:s=>u(void 0,null,function*(){let{delegate:d}=i(!0);if(d)return yield d.attachViewToDom(e.el,s);let{hasController:l}=e;if(l&&s!==void 0)throw new Error("framework delegate is missing");return null}),removeViewFromDom:()=>{let{delegate:s}=i();s&&e.el!==void 0&&s.removeViewFromDom(e.el.parentElement,e.el)}}},Se=()=>{let e,n=()=>{e&&(e(),e=void 0)};return{addClickListener:(o,i)=>{n();let r=i!==void 0?document.getElementById(i):null;if(!r){T(`A trigger element with the ID "${i}" was not found in the DOM. The trigger element must be in the DOM when the "trigger" property is set on an overlay component.`,o);return}e=((s,d)=>{let l=()=>{d.present()};return s.addEventListener("click",l),()=>{s.removeEventListener("click",l)}})(r,o)},removeClickListener:n}},j=e=>{c!==void 0&&e.setAttribute("aria-hidden","true")},ee=e=>{var n;if(c===void 0)return;let t=O(c);for(let o=t.length-1;o>=0;o--){let i=t[o],r=(n=t[o+1])!==null&&n!==void 0?n:e;(r.hasAttribute("aria-hidden")||r.tagName!=="ION-TOAST")&&i.setAttribute("aria-hidden","true")}},te=()=>{if(c===void 0)return;let e=O(c);for(let n=e.length-1;n>=0;n--){let t=e[n];if(t.removeAttribute("aria-hidden"),t.tagName!=="ION-TOAST")break}},ne="ion-disable-focus-trap";export{x as a,P as b,ue as c,me as d,fe as e,pe as f,ve as g,ge as h,p as i,he as j,Oe as k,be as l,ye as m,we as n,S as o,Z as p,Ae as q,Ee as r,Se as s,ne as t};