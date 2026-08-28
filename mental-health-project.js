PORTFOLIO_PROJECTS.push({
  id:'mindsight', category:'ml', categoryLabel:'Machine Learning & Responsible AI', icon:'mind',
  title:'Mindsignal — Mental Health Score Predictor', status:'Working ML web application',
  problem:'Lifestyle, study, sleep, and digital habits can affect wellbeing, but these signals are difficult to summarize in an accessible and responsible way.',
  solution:'A privacy-focused web application that sends structured lifestyle inputs to a FastAPI backend and returns a clearly qualified machine-learning score.',
  tech:['Python','FastAPI','Machine Learning','Responsive UI','REST API'],
  result:'Provides a fast, structured score-estimation workflow; the repository does not publish a validated performance metric, and the result is explicitly not a diagnosis.',
  details:{
    users:'Students and other users exploring how routine, lifestyle, study, sleep, physical activity, and digital behavior relate to a model-generated score.',
    data:'User-entered personal, academic, digital, social-media, study, physical-activity, and sleep inputs matching the trained model and API schema.',
    architecture:'Responsive Mindsignal frontend → validated prediction request → FastAPI backend → preprocessing and trained ML model → JSON score → result card.',
    approach:'Organize inputs into personal information, digital/social-media habits, and study/lifestyle sections, validate them in the interface and API, then transform them for model inference.',
    evaluation:'The GitHub documentation does not publish model metrics, dataset provenance, or an evaluation protocol, so the portfolio makes no accuracy claim.',
    decisions:'A calm interface, explicit non-diagnostic disclaimer, and no unnecessary retention of submitted information keep responsible use central to the experience.',
    limitations:'This is an educational statistical estimate, not clinical advice. Future work should add dataset documentation, external validation, uncertainty, explainability, consent-based history, accessibility, monitoring, and drift checks.'
  },
  links:{github:'https://github.com/BABARALIKHAN098/Machine_project_portfolio/tree/main/mental_health_predictor_score',video:'assets/videos/mental-health-score-predictor.mp4'}
});
