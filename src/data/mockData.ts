export const mockUser = {
  id: '1',
  name: 'Pere Fité',
  email: 'pere@test.com',
  avatar_url: null as string | null,
  banner_color: '#2D6A4F',
  language: 'es',
  plan: 'free',
  points: 3450,
  weekly_points: 280,
  rank: 'Verificador',
  pet_name: 'Max',
  pet_type: 'dog',
  referral_code: 'PERE01',
  created_at: '2026-01-15'
};

export const ALERT_TYPES = {
  procesionaria: {
    id: 'procesionaria',
    icon: '🐛',
    color: '#a855f7',
    color_light: '#f3e8ff',
    name_es: 'Procesionaria',
    name_ca: 'Processionària',
    description_es: 'Nido o procesión de orugas procesionarias',
    description_ca: 'Niu o processó d\'erugues processionàries',
    urgency: 'high',
    first_aid_es: 'Si tu perro la ha tocado: ve al veterinario INMEDIATAMENTE. No laves la lengua.',
    first_aid_ca: 'Si el teu gos l\'ha tocat: vés al veterinari IMMEDIATAMENT. No rentis la llengua.'
  },
  veneno: {
    id: 'veneno',
    icon: '☠️',
    color: '#ef4444',
    color_light: '#fee2e2',
    name_es: 'Veneno / Cebo',
    name_ca: 'Verí / Esquer',
    description_es: 'Cebo envenenado, raticida o tóxico detectado',
    description_ca: 'Esquer enverïnat, raticida o tòxic detectat',
    urgency: 'critical',
    first_aid_es: 'Si tu perro lo ha ingerido: llama al veterinario URGENTE y muéstrale el tóxico si puedes.',
    first_aid_ca: 'Si el teu gos l\'ha ingerit: truca al veterinari URGENT i mostra-li el tòxic si pots.'
  },
  trampa: {
    id: 'trampa',
    icon: '🪤',
    color: '#f97316',
    color_light: '#fff7ed',
    name_es: 'Trampa ilegal',
    name_ca: 'Trampa il·legal',
    description_es: 'Lazo, cepo u otra trampa ilegal detectada',
    description_ca: 'Llaç, parany o altra trampa il·legal detectada',
    urgency: 'high',
    first_aid_es: 'NO intentes retirar la trampa. Llama a Agents Rurals: 900 050 051',
    first_aid_ca: 'NO intentis retirar la trampa. Truca als Agents Rurals: 900 050 051'
  },
  basura: {
    id: 'basura',
    icon: '🗑️',
    color: '#eab308',
    color_light: '#fefce8',
    name_es: 'Basura peligrosa',
    name_ca: 'Brossa perillosa',
    description_es: 'Vidrios, huesos, alimentos tóxicos u otros peligros',
    description_ca: 'Vidres, ossos, aliments tòxics o altres perills',
    urgency: 'medium',
    first_aid_es: 'Si tu perro ha ingerido algo: observa síntomas y consulta al veterinario.',
    first_aid_ca: 'Si el teu gos ha ingerit alguna cosa: observa símptomes i consulta el veterinari.'
  }
} as const;

export type AlertTypeKey = keyof typeof ALERT_TYPES;

export const mockReports = [
  { id:'r1', user_id:'1', lat:41.4036, lng:2.1744, description:'Nido grande en pino junto al camino principal del parque. Muy visible desde el sendero.', status:'ACTIVE', danger_score:85, validation_count:6, photos:[] as string[], comarca:'Barcelonès', alert_type:'procesionaria' as AlertTypeKey, created_at: new Date(Date.now()-2*24*60*60*1000).toISOString() },
  { id:'r2', user_id:'2', lat:41.5120, lng:2.0800, description:'Bolsa de procesionaria visible desde el sendero norte. Cerca del área de picnic.', status:'ACTIVE', danger_score:62, validation_count:3, photos:[] as string[], comarca:'Vallès Occidental', alert_type:'procesionaria' as AlertTypeKey, created_at: new Date(Date.now()-5*24*60*60*1000).toISOString() },
  { id:'r3', user_id:'3', lat:41.3850, lng:2.1650, description:'Cebo sospechoso encontrado cerca del parque infantil. Peligro para niños y mascotas.', status:'ACTIVE', danger_score:71, validation_count:4, photos:[] as string[], comarca:'Barcelonès', alert_type:'veneno' as AlertTypeKey, created_at: new Date(Date.now()-3*24*60*60*1000).toISOString() },
  { id:'r4', user_id:'4', lat:41.6500, lng:1.9000, description:'Múltiples nidos en zona de pinos. Zona frecuentada por senderistas.', status:'ACTIVE', danger_score:45, validation_count:2, photos:[] as string[], comarca:'Bages', alert_type:'procesionaria' as AlertTypeKey, created_at: new Date(Date.now()-8*24*60*60*1000).toISOString() },
  { id:'r5', user_id:'5', lat:41.7200, lng:2.4500, description:'Trampa ilegal detectada en ruta de senderismo popular.', status:'DECAYING', danger_score:28, validation_count:1, photos:[] as string[], comarca:'Osona', alert_type:'trampa' as AlertTypeKey, created_at: new Date(Date.now()-12*24*60*60*1000).toISOString() },
  { id:'r6', user_id:'1', lat:41.4500, lng:2.2500, description:'Procesionaria cruzando el camino esta mañana. Cadena larga de orugas.', status:'ACTIVE', danger_score:92, validation_count:8, photos:[] as string[], comarca:'Barcelonès', alert_type:'procesionaria' as AlertTypeKey, created_at: new Date(Date.now()-1*24*60*60*1000).toISOString() },
  { id:'r7', user_id:'3', lat:41.9800, lng:2.8200, description:'Vidrios rotos y basura peligrosa en zona de paseo de perros.', status:'ACTIVE', danger_score:38, validation_count:1, photos:[] as string[], comarca:'Garrotxa', alert_type:'basura' as AlertTypeKey, created_at: new Date(Date.now()-6*24*60*60*1000).toISOString() },
  { id:'r8', user_id:'2', lat:41.2800, lng:1.9800, description:'Varios nidos en zona residencial con muchos niños.', status:'ACTIVE', danger_score:78, validation_count:5, photos:[] as string[], comarca:'Baix Llobregat', alert_type:'procesionaria' as AlertTypeKey, created_at: new Date(Date.now()-4*24*60*60*1000).toISOString() }
];

export const mockNotifications = [
  { id:'n1', type:'DANGER_NEARBY', title_es:'⚠️ Peligro detectado cerca de ti', title_ca:'⚠️ Perill detectat a prop teu', body_es:'Procesionaria a 350m de tu zona guardada "Parque cerca de casa"', body_ca:'Processionària a 350m de la teva zona guardada "Parc a prop de casa"', read:false, created_at: new Date(Date.now()-30*60*1000).toISOString() },
  { id:'n2', type:'REPORT_CONFIRMED', title_es:'✅ Tu reporte ha sido confirmado', title_ca:'✅ El teu report ha estat confirmat', body_es:'6 usuarios han confirmado tu avistamiento en Barcelonès', body_ca:'6 usuaris han confirmat el teu avistament al Barcelonès', read:false, created_at: new Date(Date.now()-2*60*60*1000).toISOString() },
  { id:'n3', type:'BADGE_EARNED', title_es:'🏅 Nueva medalla: Verificador', title_ca:'🏅 Nova medalla: Verificador', body_es:'+200 puntos bonus conseguidos', body_ca:'+200 punts bonus aconseguits', read:true, created_at: new Date(Date.now()-24*60*60*1000).toISOString() },
  { id:'n4', type:'DECAY_REMINDER', title_es:'❓ ¿Sigue activo el nido?', title_ca:'❓ Continua actiu el niu?', body_es:'Han pasado 10 días desde tu reporte en Osona. ¿Lo ves todavía?', body_ca:'Han passat 10 dies des del teu report a Osona. Encara el veus?', read:true, created_at: new Date(Date.now()-48*60*60*1000).toISOString() },
  { id:'n5', type:'WEEKLY_RANKING', title_es:'📊 Ranking semanal actualizado', title_ca:'📊 Rànquing setmanal actualitzat', body_es:'Tu posición esta semana: #3 en Barcelonès', body_ca:'La teva posició aquesta setmana: #3 al Barcelonès', read:true, created_at: new Date(Date.now()-72*60*60*1000).toISOString() }
];

export const mockRanking = [
  { id:'u1', name:'Maria Garcia', rank:'Guardián', points:8450, weekly_points:520, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u2', name:'Joan Puig', rank:'Protector', points:6200, weekly_points:410, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u3', name:'Pere Fité', rank:'Verificador', points:3450, weekly_points:280, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u4', name:'Anna Mas', rank:'Verificador', points:3100, weekly_points:250, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u5', name:'Lluís Serra', rank:'Reportador', points:2800, weekly_points:190, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u6', name:'Marta Vila', rank:'Reportador', points:2200, weekly_points:160, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u7', name:'Carles Vidal', rank:'Explorador', points:1500, weekly_points:120, avatar_url:null as string | null, comarca:'Barcelonès' },
  { id:'u8', name:'Rosa Ferrer', rank:'Explorador', points:1200, weekly_points:95, avatar_url:null as string | null, comarca:'Barcelonès' }
];

export const mockBadges = [
  // EXPLORADOR (8)
  { id:'primer_pas', name_es:'Primer Paso', name_ca:'Primer Pas', icon:'🌱', category:'explorador', rarity:'comú', rarity_color:'#9ca3af', earned:true, earned_at:'2026-01-16', points_bonus:100, requirement_es:'Publica tu primer reporte', requirement_ca:'Publica el teu primer report', progress:1, total:1 },
  { id:'cartograf', name_es:'Cartógrafo', name_ca:'Cartògraf', icon:'📍', category:'explorador', rarity:'comú', rarity_color:'#9ca3af', earned:true, earned_at:'2026-01-20', points_bonus:200, requirement_es:'Reporta en 5 zonas distintas', requirement_ca:'Reporta en 5 zones distintes', progress:5, total:5 },
  { id:'explorador_cat', name_es:'Explorador de Cataluña', name_ca:'Explorador de Catalunya', icon:'🗺️', category:'explorador', rarity:'inedit', rarity_color:'#22c55e', earned:false, points_bonus:500, requirement_es:'Reporta en 5 comarcas diferentes', requirement_ca:'Reporta en 5 comarques diferents', progress:2, total:5, motivator_es:'Has explorado 2 de 5 comarcas — ¡sigue!', motivator_ca:'Has explorat 2 de 5 comarques — continua!' },
  { id:'gran_explorador', name_es:'Gran Explorador', name_ca:'Gran Explorador', icon:'🌍', category:'explorador', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:1000, requirement_es:'Reporta en 10 comarcas diferentes', requirement_ca:'Reporta en 10 comarques diferents', progress:2, total:10, motivator_es:'Te faltan 8 comarcas más', motivator_ca:'Et falten 8 comarques més' },
  { id:'muntanyenc', name_es:'Montañero', name_ca:'Muntanyenc', icon:'🏔️', category:'explorador', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:300, requirement_es:'Reporta a más de 800m de altitud', requirement_ca:'Reporta a més de 800m d\'altitud', progress:0, total:1, motivator_es:'Sube a la montaña y reporta un nido', motivator_ca:'Puja a la muntanya i reporta un niu' },
  { id:'costaner', name_es:'Costero', name_ca:'Costaner', icon:'🏖️', category:'explorador', rarity:'inedit', rarity_color:'#22c55e', earned:false, points_bonus:300, requirement_es:'Reporta a menos de 2km del mar', requirement_ca:'Reporta a menys de 2km del mar', progress:0, total:1, motivator_es:'Reporta en una zona costera', motivator_ca:'Reporta en una zona costanera' },
  { id:'tota_catalunya', name_es:'Toda Cataluña', name_ca:'Tota Catalunya', icon:'🌐', category:'explorador', rarity:'epic', rarity_color:'#a855f7', earned:false, points_bonus:2000, requirement_es:'Reporta en las 4 provincias catalanas', requirement_ca:'Reporta a les 4 províncies catalanes', progress:1, total:4, motivator_es:'Has cubierto 1 de 4 provincias', motivator_ca:'Has cobert 1 de 4 províncies' },
  { id:'primer_temporada', name_es:'Primero de Temporada', name_ca:'Primer de Temporada', icon:'⚡', category:'explorador', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:500, requirement_es:'Primer reporte de la temporada en tu comarca', requirement_ca:'Primer report de la temporada a la teva comarca', progress:0, total:1, motivator_es:'Sé el primero en reportar cada octubre', motivator_ca:'Sigues el primer a reportar cada octubre' },
  // VALIDADOR (6)
  { id:'primer_ull', name_es:'Primer Ojo', name_ca:'Primer Ull', icon:'👁️', category:'validador', rarity:'comú', rarity_color:'#9ca3af', earned:true, earned_at:'2026-01-17', points_bonus:50, requirement_es:'Realiza tu primera validación', requirement_ca:'Realitza la teva primera validació', progress:1, total:1 },
  { id:'verificador', name_es:'Verificador', name_ca:'Verificador', icon:'🤝', category:'validador', rarity:'inedit', rarity_color:'#22c55e', earned:true, earned_at:'2026-02-01', points_bonus:200, requirement_es:'Realiza 10 validaciones', requirement_ca:'Realitza 10 validacions', progress:10, total:10 },
  { id:'pilar_comunitat', name_es:'Pilar Comunidad', name_ca:'Pilar Comunitat', icon:'💪', category:'validador', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:500, requirement_es:'Realiza 50 validaciones', requirement_ca:'Realitza 50 validacions', progress:23, total:50, motivator_es:'¡Casi! Te faltan 27 validaciones', motivator_ca:'Gairebé! Et falten 27 validacions' },
  { id:'mestre_validador', name_es:'Maestro Validador', name_ca:'Mestre Validador', icon:'🏅', category:'validador', rarity:'epic', rarity_color:'#a855f7', earned:false, points_bonus:1000, requirement_es:'Realiza 100 validaciones', requirement_ca:'Realitza 100 validacions', progress:23, total:100, motivator_es:'Te faltan 77 validaciones para el maestro', motivator_ca:'Et falten 77 validacions per al mestre' },
  { id:'llegenda_validador', name_es:'Leyenda Validador', name_ca:'Llegenda Validador', icon:'💎', category:'validador', rarity:'llegenda', rarity_color:'#f59e0b', earned:false, points_bonus:5000, requirement_es:'Realiza 500 validaciones', requirement_ca:'Realitza 500 validacions', progress:23, total:500, motivator_es:'Solo los más comprometidos llegan aquí', motivator_ca:'Només els més compromesos arriben aquí' },
  { id:'resposta_rapida', name_es:'Respuesta Rápida', name_ca:'Resposta Ràpida', icon:'⚡', category:'validador', rarity:'inedit', rarity_color:'#22c55e', earned:false, points_bonus:100, requirement_es:'Valida un reporte en menos de 1 hora', requirement_ca:'Valida un report en menys d\'1 hora', progress:0, total:1, motivator_es:'Valida rápido cuando veas un nuevo reporte', motivator_ca:'Valida ràpid quan vegis un nou report' },
  // FOTÒGRAF (5)
  { id:'primer_flash', name_es:'Primer Flash', name_ca:'Primer Flash', icon:'📸', category:'fotograf', rarity:'comú', rarity_color:'#9ca3af', earned:true, earned_at:'2026-01-18', points_bonus:50, requirement_es:'Sube tu primera foto', requirement_ca:'Puja la teva primera foto', progress:1, total:1 },
  { id:'cineasta', name_es:'Cineasta', name_ca:'Cineasta', icon:'🎬', category:'fotograf', rarity:'inedit', rarity_color:'#22c55e', earned:false, points_bonus:100, requirement_es:'Sube tu primer vídeo', requirement_ca:'Puja el teu primer vídeo', progress:0, total:1, motivator_es:'Graba un vídeo en tu próximo reporte', motivator_ca:'Grava un vídeo en el teu proper report' },
  { id:'fotografo', name_es:'Fotógrafo', name_ca:'Fotògraf', icon:'📷', category:'fotograf', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:500, requirement_es:'Sube 20 fotos en total', requirement_ca:'Puja 20 fotos en total', progress:5, total:20, motivator_es:'Has subido 5 de 20 fotos', motivator_ca:'Has pujat 5 de 20 fotos' },
  { id:'documentalista', name_es:'Documentalista', name_ca:'Documentalista', icon:'🎥', category:'fotograf', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:500, requirement_es:'Sube 10 vídeos en total', requirement_ca:'Puja 10 vídeos en total', progress:0, total:10, motivator_es:'Graba vídeos en tus reportes', motivator_ca:'Grava vídeos als teus reports' },
  { id:'foto_destacada', name_es:'Foto Destacada', name_ca:'Foto Destacada', icon:'🌟', category:'fotograf', rarity:'epic', rarity_color:'#a855f7', earned:false, points_bonus:300, requirement_es:'Una foto tuya supera 50 visualizaciones', requirement_ca:'Una foto teva supera 50 visualitzacions', progress:12, total:50, motivator_es:'Tu mejor foto tiene 12 visualizaciones', motivator_ca:'La teva millor foto té 12 visualitzacions' },
  // RATXA (6)
  { id:'consistent', name_es:'Constante', name_ca:'Consistent', icon:'🔥', category:'ratxa', rarity:'inedit', rarity_color:'#22c55e', earned:false, points_bonus:200, requirement_es:'7 días seguidos activo', requirement_ca:'7 dies seguits actiu', progress:4, total:7, motivator_es:'Llevas 4 días seguidos — ¡aguanta!', motivator_ca:'Portes 4 dies seguits — aguanta!' },
  { id:'dedicat', name_es:'Dedicado', name_ca:'Dedicat', icon:'💫', category:'ratxa', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:500, requirement_es:'30 días seguidos activo', requirement_ca:'30 dies seguits actiu', progress:4, total:30, motivator_es:'Te faltan 26 días para el dedicado', motivator_ca:'Et falten 26 dies per al dedicat' },
  { id:'incombustible', name_es:'Incombustible', name_ca:'Incombustible', icon:'🌟', category:'ratxa', rarity:'epic', rarity_color:'#a855f7', earned:false, points_bonus:2000, requirement_es:'100 días seguidos activo', requirement_ca:'100 dies seguits actiu', progress:4, total:100, motivator_es:'Solo los más constantes llegan a 100 días', motivator_ca:'Només els més constants arriben a 100 dies' },
  { id:'temporada_completa', name_es:'Temporada Completa', name_ca:'Temporada Completa', icon:'📅', category:'ratxa', rarity:'epic', rarity_color:'#a855f7', earned:false, points_bonus:3000, requirement_es:'Activo todos los meses de enero a mayo', requirement_ca:'Actiu tots els mesos de gener a maig', progress:3, total:5, motivator_es:'Has estado activo en 3 de 5 meses de temporada', motivator_ca:'Has estat actiu en 3 de 5 mesos de temporada' },
  { id:'any_sencer', name_es:'Año Entero', name_ca:'Any Sencer', icon:'🗓️', category:'ratxa', rarity:'llegenda', rarity_color:'#f59e0b', earned:false, points_bonus:5000, requirement_es:'Activo durante 365 días', requirement_ca:'Actiu durant 365 dies', progress:75, total:365, motivator_es:'Llevas 75 días en la plataforma', motivator_ca:'Portes 75 dies a la plataforma' },
  { id:'hivern_actiu', name_es:'Invierno Activo', name_ca:'Hivern Actiu', icon:'❄️', category:'ratxa', rarity:'inedit', rarity_color:'#22c55e', earned:false, points_bonus:300, requirement_es:'Reporta en enero o febrero', requirement_ca:'Reporta al gener o febrer', progress:0, total:1, motivator_es:'Los nidos son más visibles en invierno', motivator_ca:'Els nius són més visibles a l\'hivern' },
  // HEROI (7)
  { id:'heroi_silencios', name_es:'Héroe Silencioso', name_ca:'Heroi Silenciós', icon:'🆘', category:'heroi', rarity:'epic', rarity_color:'#a855f7', earned:false, points_bonus:2000, requirement_es:'Tu reporte generó acción municipal oficial', requirement_ca:'El teu report va generar acció municipal oficial', progress:0, total:1, motivator_es:'Reporta zonas críticas con muchas validaciones', motivator_ca:'Reporta zones crítiques amb moltes validacions' },
  { id:'amic_animals', name_es:'Amigo de los Animales', name_ca:'Amic dels Animals', icon:'🐕', category:'heroi', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:500, requirement_es:'20 reportes cerca de parques caninos', requirement_ca:'20 reports prop de parcs canins', progress:8, total:20, motivator_es:'Has hecho 8 de 20 reportes en zonas caninas', motivator_ca:'Has fet 8 de 20 reports en zones canines' },
  { id:'protector_infancia', name_es:'Protector de la Infancia', name_ca:'Protector de la Infància', icon:'👶', category:'heroi', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:500, requirement_es:'20 reportes cerca de colegios o parques infantiles', requirement_ca:'20 reports prop de col·legis o parcs infantils', progress:3, total:20, motivator_es:'Has hecho 3 de 20 reportes cerca de colegios', motivator_ca:'Has fet 3 de 20 reports prop de col·legis' },
  { id:'top3_setmana', name_es:'Top 3 Semana', name_ca:'Top 3 Setmana', icon:'🏆', category:'heroi', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:300, requirement_es:'Termina en el top 3 del ranking semanal', requirement_ca:'Acaba al top 3 del rànquing setmanal', progress:0, total:1, motivator_es:'Esta semana estás en el #3 — ¡mantente!', motivator_ca:'Aquesta setmana ets el #3 — mantén-te!' },
  { id:'numero_1', name_es:'Número 1', name_ca:'Número 1', icon:'👑', category:'heroi', rarity:'epic', rarity_color:'#a855f7', earned:false, points_bonus:500, requirement_es:'Primer puesto en el ranking semanal', requirement_ca:'Primer lloc al rànquing setmanal', progress:0, total:1, motivator_es:'Gana el ranking semanal de tu comarca', motivator_ca:'Guanya el rànquing setmanal de la teva comarca' },
  { id:'ambaixador', name_es:'Embajador', name_ca:'Ambaixador', icon:'🌐', category:'heroi', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:1000, requirement_es:'10 amigos registrados via tu enlace', requirement_ca:'10 amics registrats via el teu enllaç', progress:2, total:10, motivator_es:'Has referido 2 de 10 amigos', motivator_ca:'Has referit 2 de 10 amics' },
  { id:'super_ambaixador', name_es:'Super Embajador', name_ca:'Super Ambaixador', icon:'💎', category:'heroi', rarity:'epic', rarity_color:'#a855f7', earned:false, points_bonus:3000, requirement_es:'5 amigos suscritos al Plan Familiar', requirement_ca:'5 amics subscrits al Pla Familiar', progress:0, total:5, motivator_es:'Consigue que tus amigos se suscriban', motivator_ca:'Aconsegueix que els teus amics es subscriguin' },
  // ALERTA (4)
  { id:'cacador_procesionaria', name_es:'Cazador Procesionaria', name_ca:'Caçador Processionària', icon:'🐛', category:'alerta', rarity:'inedit', rarity_color:'#22c55e', earned:false, points_bonus:300, requirement_es:'10 reportes de procesionaria', requirement_ca:'10 reports de processionària', progress:6, total:10, motivator_es:'Te faltan 4 reportes de procesionaria', motivator_ca:'Et falten 4 reports de processionària' },
  { id:'detector_veri', name_es:'Detective Veneno', name_ca:'Detector Verí', icon:'☠️', category:'alerta', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:500, requirement_es:'Reporta 3 cebos envenenados confirmados', requirement_ca:'Reporta 3 esquers enverinats confirmats', progress:1, total:3, motivator_es:'Has detectado 1 de 3 venenos', motivator_ca:'Has detectat 1 de 3 verins' },
  { id:'anti_trampes', name_es:'Anti-Trampas', name_ca:'Anti-Trampes', icon:'🪤', category:'alerta', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:500, requirement_es:'Reporta 3 trampas ilegales confirmadas', requirement_ca:'Reporta 3 trampes il·legals confirmades', progress:0, total:3, motivator_es:'Las trampas ilegales son muy peligrosas — repórtalas', motivator_ca:'Les trampes il·legals són molt perilloses — reporta-les' },
  { id:'netejador', name_es:'Limpiador', name_ca:'Netejador', icon:'🗑️', category:'alerta', rarity:'inedit', rarity_color:'#22c55e', earned:false, points_bonus:200, requirement_es:'5 reportes de basura peligrosa', requirement_ca:'5 reports de brossa perillosa', progress:1, total:5, motivator_es:'Te faltan 4 reportes de basura peligrosa', motivator_ca:'Et falten 4 reports de brossa perillosa' },
  // COMUNITAT (5)
  { id:'primer_vot', name_es:'Primer Voto', name_ca:'Primer Vot', icon:'🗳️', category:'comunitat', rarity:'comú', rarity_color:'#9ca3af', earned:true, earned_at:'2026-01-17', points_bonus:30, requirement_es:'Tu primer reporte validado por otro usuario', requirement_ca:'El teu primer report validat per un altre usuari', progress:1, total:1 },
  { id:'difusor', name_es:'Difusor', name_ca:'Difusor', icon:'📢', category:'comunitat', rarity:'inedit', rarity_color:'#22c55e', earned:false, points_bonus:200, requirement_es:'Comparte 10 alertas por WhatsApp', requirement_ca:'Comparteix 10 alertes per WhatsApp', progress:3, total:10, motivator_es:'Has compartido 3 de 10 alertas', motivator_ca:'Has compartit 3 de 10 alertes' },
  { id:'collaborador', name_es:'Colaborador', name_ca:'Col·laborador', icon:'🤝', category:'comunitat', rarity:'inedit', rarity_color:'#22c55e', earned:false, points_bonus:300, requirement_es:'Ayuda a resolver 5 reportes confirmando su estado', requirement_ca:'Ajuda a resoldre 5 reports confirmant el seu estat', progress:2, total:5, motivator_es:'Has ayudado a resolver 2 de 5 reportes', motivator_ca:'Has ajudat a resoldre 2 de 5 reports' },
  { id:'veterà_comunitat', name_es:'Veterano Comunidad', name_ca:'Veterà Comunitat', icon:'🎖️', category:'comunitat', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:1000, requirement_es:'1 año activo en la plataforma', requirement_ca:'1 any actiu a la plataforma', progress:75, total:365, motivator_es:'Llevas 75 días — te faltan 290 para veterano', motivator_ca:'Portes 75 dies — et falten 290 per a veterà' },
  { id:'salvador_zona', name_es:'Salvador de Zona', name_ca:'Salvador de Zona', icon:'🛡️', category:'comunitat', rarity:'epic', rarity_color:'#a855f7', earned:false, points_bonus:1500, requirement_es:'Tus reportes protegen una zona durante toda una temporada', requirement_ca:'Els teus reports protegeixen una zona durant tota una temporada', progress:0, total:1, motivator_es:'Mantén reportes activos en la misma zona durante toda la temporada', motivator_ca:'Mantén reports actius a la mateixa zona durant tota la temporada' },
  // ESPECIAL (6)
  { id:'fundador', name_es:'Fundador', name_ca:'Fundador', icon:'⭐', category:'especial', rarity:'llegenda', rarity_color:'#f59e0b', earned:true, earned_at:'2026-01-15', points_bonus:1000, requirement_es:'Únete en los primeros 3 meses — EDICIÓN LIMITADA', requirement_ca:'Uneix-te als primers 3 mesos — EDICIÓ LIMITADA', limited:true, progress:1, total:1 },
  { id:'beta_tester', name_es:'Beta Tester', name_ca:'Beta Tester', icon:'🏅', category:'especial', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:500, requirement_es:'Reportaste un bug que fue arreglado', requirement_ca:'Vas reportar un error que va ser arreglat', progress:0, total:1, motivator_es:'Usa el botón "Reportar problema" en ajustes', motivator_ca:'Usa el botó "Reportar problema" a ajustos' },
  { id:'veterà', name_es:'Veterano', name_ca:'Veterà', icon:'🎗️', category:'especial', rarity:'rar', rarity_color:'#3b82f6', earned:false, points_bonus:1000, requirement_es:'1 año de antigüedad en ProcesoCat', requirement_ca:'1 any d\'antiguitat a ProcesoCat', progress:75, total:365, motivator_es:'Llevas 75 días — te faltan 290 días', motivator_ca:'Portes 75 dies — et falten 290 dies' },
  { id:'dos_anys', name_es:'Dos Años', name_ca:'Dos Anys', icon:'🔱', category:'especial', rarity:'llegenda', rarity_color:'#f59e0b', earned:false, points_bonus:3000, requirement_es:'2 años de antigüedad en ProcesoCat', requirement_ca:'2 anys d\'antiguitat a ProcesoCat', progress:75, total:730, motivator_es:'Solo los más fieles llegan a 2 años', motivator_ca:'Només els més fidels arriben a 2 anys' },
  { id:'llegenda', name_es:'Leyenda de Cataluña', name_ca:'Llegenda de Catalunya', icon:'👑', category:'especial', rarity:'llegenda', rarity_color:'#f59e0b', earned:false, points_bonus:0, requirement_es:'Alcanza 100.000 puntos totales', requirement_ca:'Assoleix 100.000 punts totals', progress:3450, total:100000, motivator_es:'El máximo rango — solo los elegidos llegan', motivator_ca:'El màxim rang — només els elegits hi arriben' },
  { id:'enllaç_institucional', name_es:'Enlace Institucional', name_ca:'Enllaç Institucional', icon:'🏛️', category:'especial', rarity:'llegenda', rarity_color:'#f59e0b', earned:false, points_bonus:5000, requirement_es:'Refiere un municipio al Plan Municipi', requirement_ca:'Refereix un municipi al Pla Municipi', progress:0, total:1, motivator_es:'Contacta con tu ayuntamiento sobre ProcesoCat', motivator_ca:'Contacta amb el teu ajuntament sobre ProcesoCat' }
];

export const mockSavedZones = [
  { id:'z1', name:'Parque cerca de casa', lat:41.4036, lng:2.1744, radius_km:2, alert_threshold:40, current_danger_score:85 },
  { id:'z2', name:'Ruta del perro', lat:41.3900, lng:2.1600, radius_km:1, alert_threshold:60, current_danger_score:30 },
  { id:'z3', name:'Colegio niños', lat:41.4100, lng:2.1800, radius_km:0.5, alert_threshold:20, current_danger_score:12 }
];

export const mockStats = {
  totalReports: 8,
  totalValidations: 23,
  totalPhotos: 5,
  totalComments: 0
};

export const mockUsers = [
  {id:'u1', name:'Maria Garcia', email:'maria@test.com', plan:'familiar', points:8450, reports:45, created_at:'2026-01-10', role:'user', status:'active'},
  {id:'u2', name:'Joan Puig', email:'joan@test.com', plan:'familiar', points:6200, reports:32, created_at:'2026-01-12', role:'user', status:'active'},
  {id:'u3', name:'Pere Fité', email:'pere@test.com', plan:'familiar', points:3450, reports:8, created_at:'2026-01-15', role:'admin', status:'active'},
  {id:'u4', name:'Anna Mas', email:'anna@test.com', plan:'free', points:3100, reports:15, created_at:'2026-01-20', role:'user', status:'active'},
  {id:'u5', name:'Lluís Serra', email:'lluis@test.com', plan:'free', points:2800, reports:12, created_at:'2026-02-01', role:'user', status:'active'},
  {id:'u6', name:'Ajuntament Mollet', email:'mollet@ajuntament.cat', plan:'municipi', points:0, reports:0, created_at:'2026-02-15', role:'municipi', status:'active'},
  {id:'u7', name:'Marta Vila', email:'marta@test.com', plan:'free', points:2200, reports:9, created_at:'2026-02-20', role:'user', status:'active'},
  {id:'u8', name:'Diputació Barcelona', email:'diputacio@diba.cat', plan:'municipi', points:0, reports:0, created_at:'2026-03-01', role:'municipi', status:'active'}
];

export const mockZoneAlerts = [
  {id:'a1', zone_name:'Parc de Collserola', comarca:'Barcelonès', lat:41.4036, lng:2.1744, max_danger:85, report_count:6, created_at: new Date(Date.now()-2*24*60*60*1000).toISOString(), is_active:true},
  {id:'a2', zone_name:'Parc de la Ciutadella', comarca:'Barcelonès', lat:41.3850, lng:2.1880, max_danger:71, report_count:4, created_at: new Date(Date.now()-3*24*60*60*1000).toISOString(), is_active:true},
  {id:'a3', zone_name:'Montserrat Nord', comarca:'Bages', lat:41.6000, lng:1.8300, max_danger:62, report_count:3, created_at: new Date(Date.now()-5*24*60*60*1000).toISOString(), is_active:false},
  {id:'a4', zone_name:'Zona Residencial Mollet', comarca:'Vallès Oriental', lat:41.5200, lng:2.2100, max_danger:78, report_count:5, created_at: new Date(Date.now()-1*24*60*60*1000).toISOString(), is_active:true}
];

export const mockRouteHistory = [
  {id:'rh1', name_es:'Ruta del parque', name_ca:'Ruta del parc', result:'SEGURA', distance:1.8, date: new Date(Date.now()-2*24*60*60*1000).toISOString()},
  {id:'rh2', name_es:'Ruta del bosque', name_ca:'Ruta del bosc', result:'PRECAUCIÓN', distance:3.2, date: new Date(Date.now()-5*24*60*60*1000).toISOString()},
  {id:'rh3', name_es:'Ruta casa-colegio', name_ca:'Ruta casa-escola', result:'SEGURA', distance:0.9, date: new Date(Date.now()-7*24*60*60*1000).toISOString()}
];

export const PLAN_LIMITS = {
  free: {
    reports_per_month: 3,
    photos_per_report: 2,
    saved_zones: 0,
    video_upload: false,
    push_notifications: false,
    paseo_seguro: false,
    weekly_pdf: false,
    api_access: false,
    official_validator: false,
    data_export: false,
    municipality_dashboard: false
  },
  familiar: {
    reports_per_month: -1,
    photos_per_report: 5,
    saved_zones: 10,
    video_upload: true,
    push_notifications: true,
    paseo_seguro: true,
    weekly_pdf: true,
    api_access: false,
    official_validator: false,
    data_export: false,
    municipality_dashboard: false
  },
  municipi: {
    reports_per_month: -1,
    photos_per_report: -1,
    saved_zones: -1,
    video_upload: true,
    push_notifications: true,
    paseo_seguro: true,
    weekly_pdf: true,
    api_access: true,
    official_validator: true,
    data_export: true,
    municipality_dashboard: true
  }
};

// ═══════════════════════════════
// ANALYTICS DATA
// ═══════════════════════════════

export const mockWeeklyReports = [
  { week: 'S1 Mar', procesionaria: 12, veneno: 2, trampa: 1, basura: 3 },
  { week: 'S2 Mar', procesionaria: 18, veneno: 3, trampa: 0, basura: 5 },
  { week: 'S3 Mar', procesionaria: 25, veneno: 1, trampa: 2, basura: 4 },
  { week: 'S4 Mar', procesionaria: 31, veneno: 4, trampa: 1, basura: 6 },
  { week: 'S1 Abr', procesionaria: 22, veneno: 2, trampa: 3, basura: 2 },
  { week: 'S2 Abr', procesionaria: 15, veneno: 1, trampa: 0, basura: 3 },
];

export const mockTemporalHeatmap = [
  // hour (0-23) x day (0=Mon..6=Sun) x intensity (0-100)
  { hour: 7, day: 0, intensity: 20 }, { hour: 8, day: 0, intensity: 45 },
  { hour: 9, day: 0, intensity: 60 }, { hour: 10, day: 0, intensity: 55 },
  { hour: 17, day: 0, intensity: 70 }, { hour: 18, day: 0, intensity: 65 },
  { hour: 7, day: 1, intensity: 15 }, { hour: 8, day: 1, intensity: 40 },
  { hour: 9, day: 1, intensity: 55 }, { hour: 10, day: 1, intensity: 50 },
  { hour: 17, day: 1, intensity: 60 }, { hour: 18, day: 1, intensity: 55 },
  { hour: 7, day: 2, intensity: 25 }, { hour: 8, day: 2, intensity: 50 },
  { hour: 9, day: 2, intensity: 65 }, { hour: 10, day: 2, intensity: 60 },
  { hour: 17, day: 2, intensity: 75 }, { hour: 18, day: 2, intensity: 70 },
  { hour: 7, day: 3, intensity: 18 }, { hour: 8, day: 3, intensity: 42 },
  { hour: 9, day: 3, intensity: 58 }, { hour: 10, day: 3, intensity: 52 },
  { hour: 17, day: 3, intensity: 68 }, { hour: 18, day: 3, intensity: 62 },
  { hour: 7, day: 4, intensity: 22 }, { hour: 8, day: 4, intensity: 48 },
  { hour: 9, day: 4, intensity: 62 }, { hour: 10, day: 4, intensity: 58 },
  { hour: 17, day: 4, intensity: 72 }, { hour: 18, day: 4, intensity: 68 },
  { hour: 9, day: 5, intensity: 80 }, { hour: 10, day: 5, intensity: 85 },
  { hour: 11, day: 5, intensity: 90 }, { hour: 12, day: 5, intensity: 75 },
  { hour: 17, day: 5, intensity: 82 }, { hour: 18, day: 5, intensity: 78 },
  { hour: 9, day: 6, intensity: 75 }, { hour: 10, day: 6, intensity: 88 },
  { hour: 11, day: 6, intensity: 92 }, { hour: 12, day: 6, intensity: 80 },
  { hour: 17, day: 6, intensity: 70 }, { hour: 18, day: 6, intensity: 65 },
];

export const mockAlertDistribution = [
  { type: 'procesionaria', count: 123, percentage: 68 },
  { type: 'veneno', count: 13, percentage: 7 },
  { type: 'trampa', count: 7, percentage: 4 },
  { type: 'basura', count: 23, percentage: 13 },
];

export const mockMunicipalWeekly = [
  { week: 'S1 Mar', reportes: 45, resueltos: 12, tiempo_medio_h: 48 },
  { week: 'S2 Mar', reportes: 62, resueltos: 28, tiempo_medio_h: 36 },
  { week: 'S3 Mar', reportes: 78, resueltos: 45, tiempo_medio_h: 24 },
  { week: 'S4 Mar', reportes: 55, resueltos: 38, tiempo_medio_h: 18 },
  { week: 'S1 Abr', reportes: 41, resueltos: 30, tiempo_medio_h: 16 },
  { week: 'S2 Abr', reportes: 33, resueltos: 25, tiempo_medio_h: 14 },
];

export const mockDangerEvolution = [
  { week: 'S1 Mar', score: 35 },
  { week: 'S2 Mar', score: 48 },
  { week: 'S3 Mar', score: 62 },
  { week: 'S4 Mar', score: 71 },
  { week: 'S1 Abr', score: 55 },
  { week: 'S2 Abr', score: 42 },
];

// ═══════════════════════════════
// WEEKLY REPORTS DATA
// ═══════════════════════════════

export const mockWeeklyData = {
  week: '24-30 març 2026',
  zones: [
    { name: 'Parc prop de casa', data: [45, 52, 48, 65, 71, 68, 85], color: '#ef4444' },
    { name: 'Ruta del gos', data: [20, 18, 22, 25, 20, 15, 18], color: '#22c55e' },
    { name: 'Col·legi nens', data: [10, 12, 8, 10, 15, 12, 10], color: '#3b82f6' },
  ],
  alertTypes: { procesionaria: 12, veneno: 2, trampa: 1, basura: 3 },
  weeklyComparison: [
    { week: 'Fa 4 setm.', avg: 35 },
    { week: 'Fa 3 setm.', avg: 42 },
    { week: 'Fa 2 setm.', avg: 58 },
    { week: 'Aquesta setm.', avg: 67 },
  ],
  personalActivity: { reports: 8, validations: 23, photos: 5, shares: 12 },
  weekAlerts: [
    { id: 'wa1', type: 'procesionaria', zone: 'Parc prop de casa', level: 85, date: '2026-03-28', status: 'ACTIVE', description: 'Niu gran al pi central' },
    { id: 'wa2', type: 'veneno', zone: 'Parc prop de casa', level: 88, date: '2026-03-26', status: 'ACTIVE', description: 'Esquer sospitós prop del contenidor' },
    { id: 'wa3', type: 'procesionaria', zone: 'Ruta del gos', level: 35, date: '2026-03-25', status: 'RESOLVED', description: 'Processó activa al camí principal' },
  ],
  recommendations: [
    { icon: '⚠️', text_es: 'El peligro en tu zona principal ha aumentado un 23% esta semana.', text_ca: 'El perill a la teva zona principal ha augmentat un 23% aquesta setmana.' },
    { icon: '🐕', text_es: 'Recomendamos evitar los pinos del Parc prop de casa con Max esta semana.', text_ca: 'Recomanem evitar els pins del Parc prop de casa amb Max aquesta setmana.' },
    { icon: '🌡️', text_es: 'Marzo es el mes de máximo riesgo. Extrema precaución en zonas arboladas.', text_ca: 'Març és el mes de màxim risc. Extrema precaució en zones arbrades.' },
  ],
};

export const mockMunicipiData = {
  municipality: 'Mollet del Vallès',
  comarca: 'Vallès Oriental',
  week: '24-30 març 2026',
  ref: 'PA-2026-W13-MOLLET',
  totalAlerts: 23,
  resolvedAlerts: 8,
  activeAlerts: 15,
  criticalZones: 3,
  avgDangerScore: 67,
  previousWeekAvg: 54,
  trend: 'increasing' as const,
  topZones: [
    { name: 'Parc de Can Borrell', alerts: 8, avgScore: 82 },
    { name: 'Zona Residencial Nord', alerts: 6, avgScore: 71 },
    { name: 'Camí de la Riera', alerts: 4, avgScore: 65 },
    { name: 'Parc dels Pinetons', alerts: 3, avgScore: 58 },
    { name: 'Carrer dels Pins', alerts: 2, avgScore: 42 },
  ],
  hourlyData: [0,0,0,0,0,1,2,4,6,8,7,5,4,6,8,9,7,5,4,3,2,1,0,0],
  monthlyTrend: [
    { month: 'Gen', alerts: 8 },
    { month: 'Feb', alerts: 14 },
    { month: 'Mar', alerts: 23 },
    { month: 'Abr (prev)', alerts: 28 },
  ],
  alertTypeBreakdown: { procesionaria: 18, veneno: 2, trampa: 1, basura: 2 },
};
