import streamlit as st

def render_sidebar():
    """רנדור הסיידבר המקצועי"""
    
    # כותרת סיידבר
    st.markdown("""
    <div style="text-align: center; padding: 1rem 0; margin-bottom: 2rem;">
        <h2 style="color: #00BFFF; margin: 0;">Stock Hunter Pro</h2>
        <div style="display: flex; align-items: center; justify-content: center; margin-top: 0.5rem;">
            <div style="background: #10B981; width: 8px; height: 8px; border-radius: 50%; margin-right: 0.5rem;"></div>
            <span style="color: #10B981; font-size: 0.8rem; font-weight: 600;">LIVE DATA</span>
        </div>
    </div>
    """, unsafe_allow_html=True)
    
    # Core Analysis Tools
    st.markdown('<div class="sidebar-title">Core Analysis Tools</div>', unsafe_allow_html=True)
    
    # Trend Template - כלי פעיל
    trend_template_clicked = st.button(
        "📊 Trend Template", 
        key="trend_template",
        help="Systematic stock selection using Minervini's 8-criteria framework"
    )
    
    # Watch List עם counter
    watchlist_count = len(st.session_state.get('watchlist', []))
    watchlist_clicked = st.button(
        f"⭐ Watch List ({watchlist_count})", 
        key="watchlist",
        help="Track your selected stocks"
    )
    
    # Portfolio Analysis - Soon
    st.markdown("""
    <div class="sidebar-item" style="opacity: 0.6;">
        <span class="sidebar-icon">💼</span>
        <span>Portfolio Analysis</span>
        <span class="sidebar-soon">Soon</span>
    </div>
    """, unsafe_allow_html=True)
    
    # Stock Screener - Soon
    st.markdown("""
    <div class="sidebar-item" style="opacity: 0.6;">
        <span class="sidebar-icon">🔍</span>
        <span>Stock Screener</span>
        <span class="sidebar-soon">Soon</span>
    </div>
    """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Market Intelligence
    st.markdown('<div class="sidebar-title">Market Intelligence</div>', unsafe_allow_html=True)
    
    market_tools = [
        ("📈", "Market Overview"),
        ("🏭", "Sector Analysis"),
        ("📅", "Economic Calendar"),
        ("📰", "News & Alerts")
    ]
    
    for icon, tool in market_tools:
        st.markdown(f"""
        <div class="sidebar-item" style="opacity: 0.6;">
            <span class="sidebar-icon">{icon}</span>
            <span>{tool}</span>
            <span class="sidebar-soon">Soon</span>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Advanced Tools
    st.markdown('<div class="sidebar-title">Advanced Tools</div>', unsafe_allow_html=True)
    
    advanced_tools = [
        ("🧪", "Backtesting"),
        ("🤖", "AI Insights"),
        ("⚙️", "Settings")
    ]
    
    for icon, tool in advanced_tools:
        st.markdown(f"""
        <div class="sidebar-item" style="opacity: 0.6;">
            <span class="sidebar-icon">{icon}</span>
            <span>{tool}</span>
            <span class="sidebar-soon">Soon</span>
        </div>
        """, unsafe_allow_html=True)
    
    st.markdown("---")
    
    # Minervini Criteria - תצוגת הקריטריונים
    st.markdown('<div class="sidebar-title">Minervini Criteria</div>', unsafe_allow_html=True)
    
    criteria = [
        ("1. Price > 50MA & 200MA", True),
        ("2. 150MA > 200MA", True),
        ("3. 200MA trending up", True),
        ("4. 50MA > other MAs", True),
        ("5. Price > 30% above 52W low", True),
        ("6. Within 25% of 52W high", True),
        ("7. RS Rating ≥ 70", True),
        ("8. Within 25% of 52W high", True)
    ]
    
    for criterion, required in criteria:
        status_icon = "✓ REQ" if required else "✓ OPT"
        color = "#10B981" if required else "#F59E0B"
        
        st.markdown(f"""
        <div style="
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 0.5rem; 
            margin: 0.25rem 0;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            font-size: 0.8rem;
        ">
            <span>{criterion}</span>
            <span style="color: {color}; font-weight: 600; font-size: 0.7rem;">{status_icon}</span>
        </div>
        """, unsafe_allow_html=True)
    
    # קביעת הכלי הנבחר
    if trend_template_clicked:
        return "Trend Template"
    elif watchlist_clicked:
        return "Watch List"
    else:
        return st.session_state.get('selected_tool', 'Trend Template')