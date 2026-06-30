-- ══════════════════════════════════════════════════════════
-- BUSCAFÉ — Seed: 7 cafeterías de Montevideo
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query
-- ══════════════════════════════════════════════════════════

insert into public.cafes
  (id, name, description, rating, open, image, direccion, distancia, zona,
   horarios, servicios, fotos, lat, lng,
   tiene_cuponera, cuponera_max, menu, promociones, eventos)
values

-- 1. Totem Coffee
('1', 'Totem Coffee',
 'Tostadero de especialidad en el corazón de Pocitos. Granos de origen único, métodos alternativos y un espacio para quedarse horas.',
 4.8, true,
 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600',
 'José Ellauri 434, Pocitos', 'A 1.2 km de tu ubicación.', 'pocitos',
 '["Lunes a Viernes · De 08:00 a 19:00","Sábados · De 09:00 a 20:00","Domingos · De 10:00 a 17:00"]',
 '["Espacio de cowork","Tostaduría propia","Espresso","Pet Friendly","Arte latte","V60 / Filtrado"]',
 '["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300","https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300","https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300"]',
 -34.906300, -56.149000,
 true, 10,
 '[{"id":"1","name":"Tostón de palta","price":"$290","image":"https://images.unsplash.com/photo-1603046891744-1f057468acaa?w=300"},{"id":"2","name":"Croissant manteca","price":"$180","image":"https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300"},{"id":"3","name":"Flat white","price":"$220","image":"https://images.unsplash.com/photo-1621510456681-2330135e5871?w=300"}]',
 '[{"id":"1","titulo":"2x1 en filtrados","descripcion":"Todos los lunes de 14 a 17 hs.","vigencia":"Hasta el 31/08","icono":"cafe-outline"}]',
 '[{"id":"1","titulo":"Cata de origen: Etiopía","fecha":"Sáb 12 Jul · 11:00","descripcion":"Exploramos tres varietales de Yirgacheffe con el tostador.","imagen":"https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300"}]'
),

-- 2. Jacinto
('2', 'Jacinto',
 'Café y bistró de Ciudad Vieja con foco en producto local y estacional. Desde el desayuno hasta el vino de la tarde.',
 4.7, true,
 'https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=600',
 'Sarandí 349, Ciudad Vieja', 'A 2.8 km de tu ubicación.', 'ciudad-vieja',
 '["Lunes a Viernes · De 09:00 a 18:00","Sábados · De 10:00 a 18:00"]',
 '["Menú de temporada","Vinos naturales","Espresso","Sin gluten","Terraza"]',
 '["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=300","https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300"]',
 -34.905200, -56.196800,
 false, 10,
 '[{"id":"1","name":"Bowl de estación","price":"$320","image":"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300"},{"id":"2","name":"Cortado","price":"$150","image":"https://images.unsplash.com/photo-1534778101976-62847782c213?w=300"}]',
 '[]', '[]'
),

-- 3. Café Brasilero
('3', 'Café Brasilero',
 'El café más antiguo de Montevideo. Desde 1877 en la misma esquina de Ciudad Vieja, con historia y espresso cargado.',
 4.5, true,
 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600',
 'Ituzaingó 1447, Ciudad Vieja', 'A 2.9 km de tu ubicación.', 'ciudad-vieja',
 '["Lunes a Sábado · De 07:00 a 21:00","Domingos · De 09:00 a 18:00"]',
 '["Espresso tradicional","Medialunas","Wi-Fi","Histórico"]',
 '["https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300","https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=300"]',
 -34.905900, -56.198300,
 false, 10,
 '[]', '[]', '[]'
),

-- 4. Belmondo Café
('4', 'Belmondo Café',
 'Espacio cultural y café en el Centro. Ideal para trabajar, leer o perderse en buena música y buen café de filtro.',
 4.4, true,
 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=600',
 'Convención 1403, Centro', 'A 1.8 km de tu ubicación.', 'centro',
 '["Lunes a Viernes · De 08:30 a 20:00","Sábados · De 10:00 a 20:00"]',
 '["Wi-Fi","Cowork","Música en vivo","Libros","Filtrado","Galería de arte"]',
 '["https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300"]',
 -34.901300, -56.179300,
 true, 10,
 '[]',
 '[{"id":"1","titulo":"Brunch de fin de semana","descripcion":"Tostón + bebida + postre por $490.","vigencia":"Sáb y Dom","icono":"sunny-outline"}]',
 '[{"id":"1","titulo":"Taller de latte art","fecha":"Dom 20 Jul · 10:00","descripcion":"Aprendé a hacer tulipas y rosetas con baristas del café.","imagen":"https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300"}]'
),

-- 5. Quínoa
('5', 'Quínoa',
 'Café saludable y plant-based en Palermo. Desayunos elaborados, granola casera y el mejor matcha de la ciudad.',
 4.6, false,
 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600',
 'Colonia 2178, Palermo', 'A 0.9 km de tu ubicación.', 'palermo',
 '["Lunes a Viernes · De 08:00 a 18:00","Sábados · De 09:00 a 16:00"]',
 '["Vegano","Sin gluten","Matcha","Bowl de açaí","Pet Friendly"]',
 '["https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300"]',
 -34.900100, -56.170200,
 false, 10,
 '[{"id":"1","name":"Bowl açaí","price":"$350","image":"https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300"},{"id":"2","name":"Matcha latte","price":"$260","image":"https://images.unsplash.com/photo-1534778101976-62847782c213?w=300"}]',
 '[]', '[]'
),

-- 6. El Club del Pan
('6', 'El Club del Pan',
 'Panadería de fermentación natural y café de especialidad. El olor a pan recién horneado te recibe desde la esquina.',
 4.5, true,
 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600',
 'Maldonado 1392, Barrio Sur', 'A 1.5 km de tu ubicación.', 'barrio-sur',
 '["Lunes a Sábado · De 08:00 a 20:00","Domingos · De 09:00 a 15:00"]',
 '["Panadería artesanal","Masa madre","Espresso","Sin gluten disponible"]',
 '["https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300"]',
 -34.904000, -56.186000,
 false, 10,
 '[]', '[]', '[]'
),

-- 7. Café Misterio
('7', 'Café Misterio',
 'Café íntimo y reservado en Pocitos. Canales de filtrado, blends de autor y una selección de tés de especialidad.',
 4.3, false,
 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=600',
 'Costa Rica 1700, Pocitos', 'A 1.8 km de tu ubicación.', 'pocitos',
 '["Martes a Viernes · De 10:00 a 19:00","Sábados y Domingos · De 10:00 a 20:00"]',
 '["Filtrado","Aeropress","Tés de especialidad","Sin Wi-Fi (para desconectarse)"]',
 '["https://images.unsplash.com/photo-1534778101976-62847782c213?w=300"]',
 -34.907800, -56.152500,
 true, 8,
 '[]', '[]', '[]'
)

on conflict (id) do update set
  name          = excluded.name,
  description   = excluded.description,
  rating        = excluded.rating,
  open          = excluded.open,
  image         = excluded.image,
  direccion     = excluded.direccion,
  distancia     = excluded.distancia,
  zona          = excluded.zona,
  horarios      = excluded.horarios,
  servicios     = excluded.servicios,
  fotos         = excluded.fotos,
  lat           = excluded.lat,
  lng           = excluded.lng,
  tiene_cuponera = excluded.tiene_cuponera,
  cuponera_max  = excluded.cuponera_max,
  menu          = excluded.menu,
  promociones   = excluded.promociones,
  eventos       = excluded.eventos;
