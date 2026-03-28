import { useEffect, useRef, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

const classroomVideo = "/videos/classroom.mp4";

function useMagnet(strength = 0.4) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    const onLeave = () => { el.style.transform = "translate(0,0)"; };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); };
  }, [strength]);
  return ref;
}

function RippleButton({ to, children, className, onBeforeNav, style }) {
  const navigate = useNavigate();
  const [ripples, setRipples] = useState([]);
  const magRef = useMagnet(0.3);

  const handleClick = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const id = Date.now();
    setRipples(prev => [...prev, { x, y, id }]);
    setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 700);
    if (onBeforeNav) {
      onBeforeNav(e.clientX, e.clientY);
      setTimeout(() => navigate(to), 650);
    } else {
      setTimeout(() => navigate(to), 120);
    }
  };

  return (
    <button ref={magRef} className={className} style={{ position: "relative", overflow: "hidden", cursor: "pointer", ...style }} onClick={handleClick}>
      {ripples.map(r => (
        <span key={r.id} style={{ position: "absolute", left: r.x, top: r.y, width: 4, height: 4, borderRadius: "50%", background: "rgba(255,255,255,0.45)", transform: "translate(-50%,-50%) scale(0)", animation: "rippleOut .7s ease-out forwards", pointerEvents: "none" }} />
      ))}
      {children}
    </button>
  );
}

function TiltCard({ children, className, style }) {
  const ref = useRef(null);
  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) scale(1.03)`;
    el.style.boxShadow = `${-x * 20}px ${-y * 20}px 40px rgba(124,58,237,0.2)`;
  };
  const onLeave = () => {
    const el = ref.current;
    if (el) { el.style.transform = "perspective(700px) rotateY(0) rotateX(0) scale(1)"; el.style.boxShadow = "none"; }
  };
  return <div ref={ref} className={className} style={{ transition: "transform .15s ease, box-shadow .15s ease", ...style }} onMouseMove={onMove} onMouseLeave={onLeave}>{children}</div>;
}

function Particles() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let W = canvas.width = canvas.offsetWidth;
    let H = canvas.height = canvas.offsetHeight;
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
      r: Math.random() * 1.8 + .4,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(167,139,250,0.55)";
        ctx.fill();
      });
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(139,92,246,${(1 - d / 110) * 0.22})`;
            ctx.lineWidth = .7;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => { W = canvas.width = canvas.offsetWidth; H = canvas.height = canvas.offsetHeight; };
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 2 }} />;
}

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [portal, setPortal] = useState(null);
  const [counts, setCounts] = useState({ a: 0, b: 0, c: 0 });
  const statsRef = useRef(null);
  const countedRef = useRef(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || countedRef.current) return;
      countedRef.current = true;
      [[50000, "a"], [500, "b"], [98, "c"]].forEach(([target, key]) => {
        let v = 0; const step = Math.ceil(target / 55);
        const t = setInterval(() => { v = Math.min(v + step, target); setCounts(p => ({ ...p, [key]: v })); if (v >= target) clearInterval(t); }, 20);
      });
    }, { threshold: 0.3 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll(".sr");
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("sr-in"); }), { threshold: 0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const chars = document.querySelectorAll(".hero-char");
    chars.forEach((c, i) => { c.style.animationDelay = `${0.3 + i * 0.045}s`; });
  }, []);

  const triggerPortal = useCallback((cx, cy) => {
    setPortal({ x: cx, y: cy });
    setTimeout(() => setPortal(null), 800);
  }, []);

  const splitChars = (text, cls) =>
    text.split("").map((ch, i) => <span key={i} className={`hero-char ${cls}`}>{ch === " " ? "\u00A0" : ch}</span>);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --bg:#06050f;
          --v1:#7c3aed;--v2:#a855f7;--v3:#c084fc;
          --cyan:#06b6d4;--pink:#ec4899;
          --text:#f1f0ff;--muted:#7c7a9e;--faint:#2d2b45;
          --border:rgba(255,255,255,0.07);
          --font:'Bricolage Grotesque',sans-serif;
          --mono:'JetBrains Mono',monospace;
        }
        html{scroll-behavior:smooth}
        body{font-family:var(--font);background:var(--bg);color:var(--text);overflow-x:hidden}
        a{text-decoration:none;color:inherit}
        button{font-family:var(--font);border:none;background:none}

        @keyframes rippleOut{to{transform:translate(-50%,-50%) scale(80);opacity:0}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0}to{opacity:1}}
        @keyframes charDrop{from{opacity:0;transform:translateY(-22px) rotateX(-90deg)}to{opacity:1;transform:translateY(0) rotateX(0)}}
        @keyframes floatY{0%,100%{transform:translateY(0) rotateX(8deg)}50%{transform:translateY(-14px) rotateX(8deg)}}
        @keyframes scanLine{0%{top:-3px}100%{top:101%}}
        @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
        @keyframes pulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.5);opacity:0}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes portalExpand{0%{transform:translate(-50%,-50%) scale(0);opacity:.9}100%{transform:translate(-50%,-50%) scale(60);opacity:0}}
        @keyframes gridMove{0%{transform:translateY(0)}100%{transform:translateY(64px)}}
        @keyframes glowPulse{0%,100%{opacity:.5}50%{opacity:1}}
        @keyframes slideInLeft{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:translateX(0)}}
        @keyframes countUp{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}
        @keyframes borderGlow{0%,100%{border-color:rgba(124,58,237,.2)}50%{border-color:rgba(124,58,237,.7)}}
        @keyframes rotate360{to{transform:rotate(360deg)}}

        .sr{opacity:0;transform:translateY(20px);transition:opacity .7s cubic-bezier(.22,1,.36,1),transform .7s cubic-bezier(.22,1,.36,1)}
        .sr-in{opacity:1;transform:translateY(0)}
        .sr.delay-1{transition-delay:.1s}.sr.delay-2{transition-delay:.2s}.sr.delay-3{transition-delay:.3s}

        .hero-char{display:inline-block;opacity:0;animation:charDrop .5s cubic-bezier(.22,1,.36,1) both}

        nav{
          position:fixed;top:0;left:0;right:0;z-index:300;
          display:flex;align-items:center;justify-content:space-between;
          padding:0 clamp(1rem,5vw,3.5rem);height:62px;
          transition:background .4s,backdrop-filter .4s,border-color .4s;
        }
        nav.scrolled{background:rgba(6,5,15,.88);backdrop-filter:blur(22px);border-bottom:1px solid var(--border)}

        .logo-wrap{display:flex;align-items:center;gap:10px}
        .logo-icon{
          width:32px;height:32px;border-radius:10px;
          background:linear-gradient(135deg,var(--v1),var(--v2));
          display:flex;align-items:center;justify-content:center;
          flex-shrink:0;position:relative;overflow:hidden;
        }
        .logo-icon::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,.2) 0%,transparent 60%)}
        .logo-icon svg{width:16px;height:16px;color:#fff;position:relative;z-index:1}
        .logo-text{font-family:var(--mono);font-size:.9rem;font-weight:700;letter-spacing:-.01em;color:var(--text)}
        .logo-text em{font-style:normal;color:var(--v3)}

        .nav-links{display:flex;align-items:center;gap:clamp(.75rem,2vw,2rem)}
        .nav-a{font-size:.82rem;font-weight:500;color:var(--muted);transition:color .2s;position:relative}
        .nav-a::after{content:'';position:absolute;bottom:-2px;left:0;right:0;height:1px;background:var(--v2);transform:scaleX(0);transition:transform .25s cubic-bezier(.22,1,.36,1)}
        .nav-a:hover{color:var(--text)}
        .nav-a:hover::after{transform:scaleX(1)}
        .nav-pill{
          padding:.44rem 1.1rem;border-radius:10px;
          border:1px solid rgba(124,58,237,.45);
          background:rgba(124,58,237,.1);
          color:var(--v3);font-size:.8rem;font-weight:600;
          transition:background .2s,border-color .2s,transform .15s,box-shadow .2s;
          cursor:pointer;
        }
        .nav-pill:hover{background:rgba(124,58,237,.2);border-color:var(--v2);transform:translateY(-1px);box-shadow:0 0 20px rgba(124,58,237,.35)}

        .hero{
          position:relative;min-height:100svh;
          display:flex;align-items:center;justify-content:center;
          overflow:hidden;padding:80px clamp(1.25rem,6vw,5rem) 4rem;
        }
        .hero-vid{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;filter:saturate(.25) brightness(.22)}
        .hero-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,5,15,.6) 0%,rgba(6,5,15,.1) 40%,rgba(6,5,15,.9) 88%,var(--bg) 100%)}
        .hero-grid-bg{
          position:absolute;inset:0;
          background-image:linear-gradient(rgba(124,58,237,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(124,58,237,.06) 1px,transparent 1px);
          background-size:60px 60px;
          animation:gridMove 10s linear infinite alternate;
          opacity:.8;
        }
        .hero-glow{position:absolute;border-radius:50%;filter:blur(100px);pointer-events:none;animation:glowPulse 4s ease-in-out infinite}
        .hg1{width:clamp(300px,55vw,700px);height:clamp(300px,55vw,700px);top:-20%;left:-15%;background:radial-gradient(circle,rgba(124,58,237,.22) 0%,transparent 70%);animation-delay:0s}
        .hg2{width:clamp(200px,40vw,500px);height:clamp(200px,40vw,500px);bottom:-10%;right:-10%;background:radial-gradient(circle,rgba(6,182,212,.15) 0%,transparent 70%);animation-delay:2s}
        .hg3{width:clamp(150px,25vw,300px);height:clamp(150px,25vw,300px);top:30%;right:5%;background:radial-gradient(circle,rgba(236,72,153,.1) 0%,transparent 70%);animation-delay:1s}

        .hero-content{position:relative;z-index:10;max-width:780px;width:100%;text-align:center}
        .hero-badge{
          display:inline-flex;align-items:center;gap:8px;
          padding:.3rem .9rem;border-radius:999px;
          border:1px solid rgba(124,58,237,.4);
          background:rgba(124,58,237,.1);
          color:#c4b5fd;font-family:var(--mono);font-size:clamp(.58rem,.75vw,.65rem);font-weight:500;
          letter-spacing:.12em;text-transform:uppercase;
          animation:fadeUp .6s ease both .2s;
          margin-bottom:1.6rem;
        }
        .badge-live{width:7px;height:7px;border-radius:50%;background:#a855f7;position:relative;flex-shrink:0}
        .badge-live::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:1px solid #a855f7;animation:pulse 1.8s ease-out infinite}

        .hero-h1{
          font-size:clamp(2.8rem,8.5vw,6.5rem);font-weight:800;
          line-height:.98;letter-spacing:-.04em;
          margin-bottom:1.5rem;perspective:600px;
        }
        .line-white{color:#fff;display:block}
        .line-grad{
          display:block;
          background:linear-gradient(90deg,#a78bfa,#e879f9,#67e8f9,#a78bfa);
          background-size:300% auto;
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
          background-clip:text;
          animation:shimmer 4s linear infinite;
        }
        .hero-sub{
          font-size:clamp(.9rem,2vw,1.1rem);color:rgba(209,206,240,.68);
          line-height:1.75;max-width:500px;margin:0 auto 2.5rem;
          animation:fadeUp .7s ease both .85s;
        }
        .hero-btns{display:flex;flex-wrap:wrap;gap:.8rem;justify-content:center;animation:fadeUp .7s ease both 1s}
        .btn-primary{
          display:inline-flex;align-items:center;gap:8px;
          padding:clamp(.8rem,1rem,1.1rem) clamp(1.5rem,3vw,2.2rem);
          border-radius:14px;
          background:linear-gradient(135deg,var(--v1),var(--v2));
          color:#fff;font-weight:700;font-size:clamp(.875rem,1.5vw,.95rem);
          box-shadow:0 0 40px rgba(124,58,237,.5),inset 0 1px 0 rgba(255,255,255,.2);
          transition:transform .2s cubic-bezier(.22,1,.36,1),box-shadow .2s;
          position:relative;overflow:hidden;
        }
        .btn-primary:hover{transform:translateY(-3px) scale(1.03);box-shadow:0 0 60px rgba(124,58,237,.7),inset 0 1px 0 rgba(255,255,255,.2)}
        .btn-primary .arr{transition:transform .25s cubic-bezier(.22,1,.36,1)}
        .btn-primary:hover .arr{transform:translateX(4px)}
        .btn-outline{
          display:inline-flex;align-items:center;gap:8px;
          padding:clamp(.8rem,1rem,1.1rem) clamp(1.5rem,3vw,2.2rem);
          border-radius:14px;border:1px solid rgba(255,255,255,.15);
          color:rgba(255,255,255,.8);font-weight:600;font-size:clamp(.875rem,1.5vw,.95rem);
          transition:background .2s,border-color .2s,transform .2s cubic-bezier(.22,1,.36,1),box-shadow .2s;
        }
        .btn-outline:hover{background:rgba(255,255,255,.07);border-color:rgba(255,255,255,.3);transform:translateY(-3px);box-shadow:0 8px 30px rgba(0,0,0,.3)}

        .hero-trust{margin-top:2.5rem;display:flex;align-items:center;justify-content:center;gap:1.5rem;flex-wrap:wrap;animation:fadeIn 1s ease both 1.3s}
        .trust-item{display:flex;align-items:center;gap:6px;color:rgba(124,120,160,.6);font-size:clamp(.65rem,.75vw,.7rem);font-weight:500}
        .trust-dot{width:3px;height:3px;border-radius:50%;background:rgba(124,120,160,.4)}

        .scroll-cue{position:absolute;bottom:1.75rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:5px;color:rgba(255,255,255,.18);font-family:var(--mono);font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;animation:fadeIn 1s ease both 1.6s;z-index:10}
        .scroll-line{width:1px;height:38px;background:linear-gradient(to bottom,rgba(124,58,237,.6),transparent);animation:floatY 2.2s ease-in-out infinite}

        .portal-ring{position:fixed;pointer-events:none;z-index:9999;width:60px;height:60px;border-radius:50%;background:radial-gradient(circle,rgba(168,85,247,.9) 0%,rgba(124,58,237,.7) 50%,transparent 70%);animation:portalExpand .8s cubic-bezier(.22,1,.36,1) forwards}

        .section{padding:clamp(4rem,9vw,8rem) clamp(1.25rem,6vw,5rem)}
        .inner{max-width:1120px;margin:0 auto}
        .eyebrow{font-family:var(--mono);font-size:.6rem;letter-spacing:.2em;text-transform:uppercase;color:var(--v3);margin-bottom:.85rem;display:flex;align-items:center;gap:8px}
        .eyebrow::before{content:'';width:24px;height:1px;background:var(--v2)}
        .sec-h2{font-size:clamp(1.7rem,4vw,3rem);font-weight:800;letter-spacing:-.03em;color:#fff;line-height:1.1;margin-bottom:1rem}
        .sec-p{color:var(--muted);font-size:clamp(.88rem,1.5vw,.98rem);line-height:1.75;max-width:480px}

        .stats-band{
          border:1px solid var(--faint);border-radius:22px;
          display:grid;grid-template-columns:repeat(3,1fr);
          overflow:hidden;margin-bottom:5rem;
          background:rgba(255,255,255,.015);
          animation:borderGlow 3s ease-in-out infinite;
        }
        .stat-c{padding:clamp(1.5rem,4vw,2.5rem);text-align:center;position:relative}
        .stat-c+.stat-c{border-left:1px solid var(--faint)}
        .stat-c::before{content:'';position:absolute;top:0;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,var(--v2),transparent);opacity:.4}
        .stat-n{font-family:var(--mono);font-size:clamp(1.8rem,5vw,3.2rem);font-weight:700;background:linear-gradient(135deg,#a78bfa,#e879f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:block;line-height:1}
        .stat-l{color:var(--muted);font-size:clamp(.6rem,.75vw,.68rem);letter-spacing:.08em;text-transform:uppercase;margin-top:.5rem}

        .feat-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,290px),1fr));gap:1px;border:1px solid var(--faint);border-radius:24px;overflow:hidden;background:var(--faint)}
        .feat-c{
          background:var(--bg);padding:clamp(1.2rem,3.5vw,1.8rem);
          transition:background .3s;cursor:default;
        }
        .feat-c:hover{background:#0d0b1e}
        .feat-icon-wrap{
          width:46px;height:46px;border-radius:14px;margin-bottom:1rem;
          display:flex;align-items:center;justify-content:center;font-size:1.2rem;
          position:relative;
        }
        .feat-icon-wrap::before{content:'';position:absolute;inset:0;border-radius:14px;opacity:.15}
        .fi-v::before{background:var(--v1)} .fi-c::before{background:var(--cyan)} .fi-p::before{background:var(--pink)}
        .fi-v{border:1px solid rgba(124,58,237,.3)} .fi-c{border:1px solid rgba(6,182,212,.3)} .fi-p{border:1px solid rgba(236,72,153,.3)}
        .feat-t{font-size:.95rem;font-weight:700;color:#fff;margin-bottom:.4rem}
        .feat-d{font-size:.8rem;color:var(--muted);line-height:1.65}

        .how-section{background:linear-gradient(180deg,transparent,rgba(124,58,237,.04),transparent);border-top:1px solid var(--faint);border-bottom:1px solid var(--faint)}
        .how-grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2.5rem,7vw,6rem);align-items:center}
        .steps{display:flex;flex-direction:column;gap:0;position:relative}
        .steps-line{position:absolute;left:16px;top:32px;bottom:32px;width:1px;background:linear-gradient(to bottom,var(--v2),var(--cyan));opacity:.25}
        .step-item{display:flex;gap:1.1rem;align-items:flex-start;padding:1.25rem 0;position:relative;z-index:1}
        .step-n{
          width:34px;height:34px;border-radius:10px;flex-shrink:0;
          background:linear-gradient(135deg,var(--v1),var(--v2));
          display:flex;align-items:center;justify-content:center;
          font-family:var(--mono);font-size:.7rem;font-weight:700;color:#fff;
          box-shadow:0 0 18px rgba(124,58,237,.4);
        }
        .step-title{font-size:.95rem;font-weight:700;color:#fff;margin-bottom:.3rem}
        .step-desc{font-size:.8rem;color:var(--muted);line-height:1.65}

        .phone-3d-wrap{display:flex;justify-content:center;perspective:1200px}
        .phone-3d{
          width:clamp(180px,38vw,220px);
          transform:rotateX(8deg) rotateY(-12deg);
          border-radius:34px;padding:12px;
          background:rgba(255,255,255,.04);
          border:1px solid rgba(255,255,255,.1);
          box-shadow:20px 40px 80px rgba(0,0,0,.6),0 0 60px rgba(124,58,237,.15),inset 0 1px 0 rgba(255,255,255,.1);
          animation:floatY 4.5s ease-in-out infinite;
          transition:transform .2s ease;
        }
        .phone-3d:hover{transform:rotateX(4deg) rotateY(-6deg) scale(1.04)}
        .phone-screen{border-radius:24px;background:#08071a;padding:1rem;position:relative;overflow:hidden;min-height:265px}
        .scan-line{position:absolute;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(124,58,237,.9),rgba(6,182,212,.6),transparent);animation:scanLine 3s linear infinite;pointer-events:none;z-index:5}
        .ph-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:.9rem}
        .ph-logo{font-family:var(--mono);font-size:.58rem;font-weight:700;background:linear-gradient(90deg,#a78bfa,#67e8f9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .ph-dots{display:flex;gap:4px}
        .ph-dot{width:6px;height:6px;border-radius:50%}
        .ph-tag{font-family:var(--mono);font-size:.48rem;color:var(--muted);text-transform:uppercase;letter-spacing:.1em;margin-bottom:.6rem}
        .ph-row{display:flex;align-items:center;gap:7px;padding:6px 8px;border-radius:9px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);margin-bottom:5px}
        .ph-av{width:24px;height:24px;border-radius:7px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:.5rem;font-weight:700;color:#fff}
        .ph-name{font-size:.6rem;color:#e2e8f0;font-weight:600;flex:1}
        .ph-badge{padding:2px 6px;border-radius:999px;font-size:.48rem;font-weight:700;text-transform:uppercase}
        .pp{background:rgba(16,185,129,.15);color:#6ee7b7}
        .pa{background:rgba(239,68,68,.15);color:#fca5a5}
        .ph-foot{margin-top:.6rem;padding:6px;border-radius:9px;background:linear-gradient(135deg,rgba(124,58,237,.15),rgba(6,182,212,.08));border:1px solid rgba(124,58,237,.25);text-align:center}
        .ph-foot-txt{font-family:var(--mono);font-size:.52rem;color:#c4b5fd;font-weight:700}
        .blink{animation:blink 1s step-end infinite}

        .cta-wrap{padding:clamp(4rem,9vw,9rem) clamp(1.25rem,6vw,5rem);position:relative;text-align:center}
        .cta-bg-glow{position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 70% 60% at 50% 55%,rgba(124,58,237,.16) 0%,transparent 70%)}
        .cta-ring{
          position:absolute;width:clamp(300px,55vw,700px);height:clamp(300px,55vw,700px);
          border-radius:50%;border:1px solid rgba(124,58,237,.08);
          top:50%;left:50%;transform:translate(-50%,-50%);
          animation:rotate360 20s linear infinite;
        }
        .cta-ring::before{content:'';position:absolute;top:-3px;left:40%;width:6px;height:6px;border-radius:50%;background:var(--v2);box-shadow:0 0 10px var(--v2)}
        .cta-box{
          position:relative;max-width:660px;margin:0 auto;
          padding:clamp(2.5rem,6vw,4.5rem) clamp(1.5rem,5vw,4rem);
          border-radius:28px;
          background:rgba(255,255,255,.025);
          border:1px solid rgba(124,58,237,.22);
          backdrop-filter:blur(16px);overflow:hidden;
          z-index:2;
        }
        .cta-box::before{content:'';position:absolute;top:0;left:10%;right:10%;height:1px;background:linear-gradient(90deg,transparent,rgba(168,85,247,.8),transparent)}
        .cta-h2{font-size:clamp(1.65rem,4vw,2.75rem);font-weight:800;letter-spacing:-.03em;color:#fff;margin-bottom:.9rem;line-height:1.12}
        .cta-p{color:var(--muted);font-size:clamp(.875rem,1.5vw,.98rem);line-height:1.7;margin-bottom:2rem}
        .cta-btns{display:flex;flex-wrap:wrap;gap:.75rem;justify-content:center}

        .chip{
          display:inline-flex;align-items:center;gap:5px;
          padding:.28rem .7rem;border-radius:999px;
          background:rgba(124,58,237,.12);border:1px solid rgba(124,58,237,.25);
          color:var(--v3);font-size:.65rem;font-weight:600;font-family:var(--mono);
          margin-bottom:1rem;
        }
        .chip-dot{width:5px;height:5px;border-radius:50%;background:var(--cyan)}

        footer{border-top:1px solid var(--faint);padding:1.5rem clamp(1.25rem,6vw,5rem);display:flex;flex-wrap:wrap;gap:.75rem;align-items:center;justify-content:space-between}
        .footer-l{font-family:var(--mono);font-size:.72rem;color:var(--muted);display:flex;align-items:center;gap:8px}
        .footer-dot{width:4px;height:4px;border-radius:50%;background:var(--v2)}
        .footer-links{display:flex;gap:1.5rem}
        .footer-links a{font-size:.75rem;color:var(--muted);transition:color .2s}
        .footer-links a:hover{color:var(--text)}

        @media(max-width:720px){
          .how-grid{grid-template-columns:1fr}
          .phone-3d-wrap{margin-top:1rem}
        }
        @media(max-width:520px){
          .stats-band{grid-template-columns:1fr}
          .stat-c+.stat-c{border-left:none;border-top:1px solid var(--faint)}
          .hero-btns,.cta-btns{flex-direction:column;align-items:stretch}
          .hero-btns button,.hero-btns a,.cta-btns button,.cta-btns a{text-align:center;justify-content:center}
          footer{flex-direction:column;text-align:center}
          .footer-links{justify-content:center}
          .nav-a{display:none}
        }
      `}</style>

      {portal && (
        <div className="portal-ring" style={{ left: portal.x, top: portal.y }} />
      )}

      <nav className={scrolled ? "scrolled" : ""}>
        <div className="logo-wrap">
          <div className="logo-icon">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="12" height="9" rx="1.5"/>
              <path d="M5 13h6M8 12v1"/>
              <path d="M5 7l2 2 4-3"/>
            </svg>
          </div>
          <div className="logo-text">Class<em>Mark</em></div>
        </div>
        <div className="nav-links">
          <a href="#features" className="nav-a">Features</a>
          <a href="#how" className="nav-a">How it works</a>
          <RippleButton to="/login" className="nav-pill">Login</RippleButton>
        </div>
      </nav>

      <section className="hero" ref={heroRef}>
        <video className="hero-vid" src={classroomVideo} autoPlay loop muted playsInline />
        <div className="hero-overlay" />
        <div className="hero-grid-bg" />
        <Particles />
        <div className="hero-glow hg1" />
        <div className="hero-glow hg2" />
        <div className="hero-glow hg3" />

        <div className="hero-content">
          <div className="hero-badge">
            <span className="badge-live" />
            Smart Attendance · Zero Proxy
          </div>

          <h1 className="hero-h1">
            <span className="line-white">{splitChars("Attendance", "")}</span>
            <span className="line-grad">{splitChars("that works.", "")}</span>
          </h1>

          <p className="hero-sub">
            ClassMark makes attendance instant, honest, and completely automated.
            Students check in digitally — teachers get real-time data, zero fuss.
          </p>

          <div className="hero-btns">
            <RippleButton to="/signup" className="btn-primary" onBeforeNav={triggerPortal}>
              Get Started Free
              <svg className="arr" width="14" height="14" fill="none" viewBox="0 0 15 15">
                <path d="M2.5 7.5h10M8 3l4.5 4.5L8 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </RippleButton>
            <RippleButton to="/login" className="btn-outline">
              Sign In
            </RippleButton>
          </div>

          <div className="hero-trust">
            <span className="trust-item">✦ 500+ Institutions</span>
            <span className="trust-dot" />
            <span className="trust-item">✦ 50k+ Students</span>
            <span className="trust-dot" />
            <span className="trust-item">✦ 98% Accuracy</span>
          </div>
        </div>

        <div className="scroll-cue">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      <section className="section">
        <div className="inner">
          <div className="stats-band sr" ref={statsRef}>
            <div className="stat-c">
              <span className="stat-n">{counts.a >= 1000 ? Math.round(counts.a / 1000) + "k" : counts.a}+</span>
              <div className="stat-l">Students enrolled</div>
            </div>
            <div className="stat-c">
              <span className="stat-n">{counts.b}+</span>
              <div className="stat-l">Institutions</div>
            </div>
            <div className="stat-c">
              <span className="stat-n">{counts.c}%</span>
              <div className="stat-l">Check-in accuracy</div>
            </div>
          </div>

          <div id="features">
            <div className="sr" style={{ marginBottom: "2.5rem" }}>
              <div className="eyebrow">What we offer</div>
              <h2 className="sec-h2">Everything your class needs</h2>
              <p className="sec-p">Designed for teachers who hate wasting time and students who just want to show up.</p>
            </div>
            <div className="feat-grid sr delay-1">
              {[
                { icon: "⚡", cls: "fi-v", t: "Instant Check-in", d: "Students mark attendance in a tap. QR-based, location-verified, tamper-proof." },
                { icon: "🌐", cls: "fi-c", t: "Geo-Fencing", d: "Attendance only works inside the classroom boundary. No remote proxies." },
                { icon: "🔒", cls: "fi-p", t: "Zero Proxy", d: "Session locks are time-bound and device-linked. Sharing codes doesn't work." },
                { icon: "📊", cls: "fi-v", t: "Live Dashboard", d: "Real-time attendance view for teachers the moment class starts." },
                { icon: "🔔", cls: "fi-c", t: "Instant Alerts", d: "Auto-notify students and parents the moment an absence is recorded." },
                { icon: "📁", cls: "fi-p", t: "Export Reports", d: "PDF and CSV reports per student, class, or date range — one click." },
              ].map(f => (
                <TiltCard className="feat-c" key={f.t}>
                  <div className={`feat-icon-wrap ${f.cls}`}>{f.icon}</div>
                  <div className="feat-t">{f.t}</div>
                  <div className="feat-d">{f.d}</div>
                </TiltCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="section how-section">
        <div className="inner">
          <div className="how-grid">
            <div>
              <div className="eyebrow sr">How it works</div>
              <h2 className="sec-h2 sr">Attendance in<br />3 steps</h2>
              <p className="sec-p sr" style={{ marginBottom: "2.25rem" }}>No hardware. No roll calls. No paper. Just open ClassMark and class begins.</p>
              <div className="steps">
                <div className="steps-line" />
                {[
                  { n: "01", t: "Teacher starts a session", d: "One tap generates a live, time-locked session with a unique class code." },
                  { n: "02", t: "Students check in", d: "Scan the QR, verify location — attendance is marked instantly and securely." },
                  { n: "03", t: "Report is locked", d: "Attendance finalizes when the session ends. Download or share in seconds." },
                ].map((s, i) => (
                  <div className={`step-item sr delay-${i + 1}`} key={s.n}>
                    <div className="step-n">{s.n}</div>
                    <div>
                      <div className="step-title">{s.t}</div>
                      <div className="step-desc">{s.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="phone-3d-wrap sr delay-2">
              <div className="phone-3d">
                <div className="phone-screen">
                  <div className="scan-line" />
                  <div className="ph-head">
                    <span className="ph-logo">ClassMark</span>
                    <div className="ph-dots">
                      <div className="ph-dot" style={{ background: "#ef4444" }} />
                      <div className="ph-dot" style={{ background: "#f59e0b" }} />
                      <div className="ph-dot" style={{ background: "#10b981" }} />
                    </div>
                  </div>
                  <div className="ph-tag">CS-301 · Live<span className="blink">_</span></div>
                  {[
                    { i: "AK", bg: "#5b50f0", name: "Aryan K.",   p: true  },
                    { i: "PD", bg: "#7c3aed", name: "Priya D.",   p: true  },
                    { i: "RV", bg: "#be185d", name: "Raj V.",     p: false },
                    { i: "SM", bg: "#0e7490", name: "Sara M.",    p: true  },
                    { i: "NK", bg: "#065f46", name: "Nikhil K.",  p: true  },
                  ].map(r => (
                    <div className="ph-row" key={r.name}>
                      <div className="ph-av" style={{ background: r.bg }}>{r.i}</div>
                      <span className="ph-name">{r.name}</span>
                      <span className={`ph-badge ${r.p ? "pp" : "pa"}`}>{r.p ? "present" : "absent"}</span>
                    </div>
                  ))}
                  <div className="ph-foot">
                    <div className="ph-foot-txt">4 / 5 present · 80%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-wrap">
        <div className="cta-bg-glow" />
        <div className="cta-ring" />
        <div className="cta-box sr">
          <div className="chip"><span className="chip-dot" />Free to start</div>
          <h2 className="cta-h2">Take attendance off<br />your to-do list — forever</h2>
          <p className="cta-p">No credit card. No hardware. Set up in under 5 minutes.<br />Join 500+ institutions already using ClassMark.</p>
          <div className="cta-btns">
            <RippleButton to="/signup" className="btn-primary" onBeforeNav={triggerPortal}>
              Create Free Account
              <svg className="arr" width="14" height="14" fill="none" viewBox="0 0 15 15">
                <path d="M2.5 7.5h10M8 3l4.5 4.5L8 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </RippleButton>
            <RippleButton to="/login" className="btn-outline">Sign In</RippleButton>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-l">
          <div className="logo-icon" style={{ width: 22, height: 22, borderRadius: 6 }}>
            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="12" height="9" rx="1.5"/><path d="M5 7l2 2 4-3"/>
            </svg>
          </div>
          <span>ClassMark</span>
          <div className="footer-dot" />
          <span>© {new Date().getFullYear()}</span>
        </div>
        <div className="footer-links">
          <a href="#">Privacy</a>
          <a href="#">Terms</a>
          <a href="#">Contact</a>
        </div>
      </footer>
    </>
  );
}