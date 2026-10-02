/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
import { Metadata } from 'next';
import Image from 'next/image';
import FamilyPrintController from './FamilyPrintController';

interface PageProps {
  params: Promise<{ id: string }>;
}

const PARAM_LABELS: Record<string, string> = {
  mmCode: 'MM Code',
  modelNo: 'Model No.',
  optionCode: 'Product Code',
  colour: 'Colour',
  wattage: 'Power (W)',
  luminousFlux: 'Luminous Flux (lm)',
  colourTemperature: 'CCT (K)',
  cri: 'CRI (Ra)',
  efficacy: 'Efficacy (lm/W)',
  beamAngle: 'Beam Angle (°)',
  ip: 'IP Rating',
  ik: 'IK Rating',
  controlGear: 'Control Gear',
  connector: 'Connector',
  dimmingType: 'Dimming Type',
  dimmingRange: 'Dimming Range',
  voltage: 'Voltage (V)',
  frequency: 'Frequency (Hz)',
  inputCurrent: 'Input Current (mA)',
  powerFactor: 'Power Factor',
  lampBase: 'Lamp Base',
  dimensions: 'Dimensions (mm)',
  recessedCutOut: 'Cut-out (mm)',
  weight: 'Weight (g)',
  lifetime: 'Lifetime (h)',
  switchingCycles: 'Switching Cycles',
  energyClass: 'Energy Class',
  protectionClass: 'Protection Class',
  glowWire: 'Glow Wire (°C)',
  housingMaterial: 'Housing Material',
  diffuserMaterial: 'Optics Material',
  operatingTemperature: 'Operating Temp (°C)',
  symbols: 'Symbols',
};

const splitParamAndUnit = (label: string): { name: string; unit?: string } => {
  if (!label) return { name: '' };
  const match = label.match(/^(.*?)\s*([([][^)\]]+[)\]])$/);
  if (match) {
    return {
      name: match[1].trim(),
      unit: match[2].trim(),
    };
  }
  return { name: label };
};

const renderParamHeader = (label: string, isVertical = false) => {
  if (isVertical) {
    return <span>{label}</span>;
  }
  const { name, unit } = splitParamAndUnit(label);
  if (!unit) {
    return <span>{name}</span>;
  }
  return (
    <span className="flex flex-col leading-tight">
      <span>{name}</span>
      <span className="text-[10px] font-normal text-gray-500 mt-0.5 normal-case tracking-normal">
        {unit}
      </span>
    </span>
  );
};

const getImageUrl = (image: any): string => {
  if (!image) return '/placeholder.png';
  const baseUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
  if (typeof image === 'string') {
    if (image.startsWith('http') || image.startsWith('//')) return image;
    return `${baseUrl}${image.startsWith('/') ? '' : '/'}${image}`;
  }
  if (image.url) {
    if (image.url.startsWith('http') || image.url.startsWith('//')) return image.url;
    return `${baseUrl}${image.url.startsWith('/') ? '' : '/'}${image.url}`;
  }
  return '/placeholder.png';
};

// Helper to resolve custom width, height, alignment, and row layout for images
const resolveImageStyles = (node: any) => {
  const fields = node.fields || {};
  const widthVal = (fields.width !== 'custom' && fields.width) || fields.customWidth || node.width || '';
  const heightVal = (fields.maxHeight !== 'custom' && fields.maxHeight) || fields.customHeight || node.height || '';
  const alignment = fields.alignment || node.format || 'center';

  let containerWidthClass = 'w-full';
  const inlineContainerStyle: React.CSSProperties = {};

  if (widthVal === '50%' || widthVal === 'half') {
    containerWidthClass = 'w-[calc(50%-0.375rem)] print:w-[calc(50%-0.25rem)] inline-flex';
  } else if (widthVal === '33%' || widthVal === '33.3%' || widthVal === 'third') {
    containerWidthClass = 'w-[calc(33.333%-0.5rem)] print:w-[calc(33.333%-0.25rem)] inline-flex';
  } else if (widthVal === '25%' || widthVal === 'quarter') {
    containerWidthClass = 'w-[calc(25%-0.5rem)] print:w-[calc(25%-0.25rem)] inline-flex';
  } else if (widthVal === '100px') {
    containerWidthClass = 'w-[100px] inline-flex';
  } else if (widthVal === '150px') {
    containerWidthClass = 'w-[150px] inline-flex';
  } else if (widthVal === '220px') {
    containerWidthClass = 'w-[220px] inline-flex';
  } else if (widthVal === '300px') {
    containerWidthClass = 'w-[300px] inline-flex';
  } else if (widthVal === '100%' || widthVal === 'full') {
    containerWidthClass = 'w-full flex';
  } else if (widthVal && widthVal !== 'auto') {
    const isPercent = typeof widthVal === 'string' && widthVal.endsWith('%');
    if (isPercent) {
      inlineContainerStyle.width = widthVal;
      containerWidthClass = 'inline-flex';
    } else {
      inlineContainerStyle.width = typeof widthVal === 'number' ? `${widthVal}px` : widthVal;
      containerWidthClass = 'inline-flex';
    }
  } else {
    containerWidthClass = 'inline-flex max-w-full';
  }

  let imgHeightClass = 'max-h-60 print:max-h-40';
  const inlineImgStyle: React.CSSProperties = {};

  if (heightVal === '90px') {
    imgHeightClass = 'max-h-[90px] print:max-h-[70px]';
  } else if (heightVal === '140px') {
    imgHeightClass = 'max-h-[140px] print:max-h-[105px]';
  } else if (heightVal === '180px') {
    imgHeightClass = 'max-h-[180px] print:max-h-[135px]';
  } else if (heightVal === '240px') {
    imgHeightClass = 'max-h-[240px] print:max-h-[175px]';
  } else if (heightVal === 'none') {
    imgHeightClass = 'max-h-none';
  } else if (heightVal && heightVal !== 'auto') {
    imgHeightClass = '';
    inlineImgStyle.maxHeight = typeof heightVal === 'number' ? `${heightVal}px` : heightVal;
  }

  let alignClass = 'items-center text-center mx-auto';
  if (alignment === 'left') {
    alignClass = 'items-start text-left mr-auto';
  } else if (alignment === 'right') {
    alignClass = 'items-end text-right ml-auto';
  }

  return {
    containerWidthClass,
    inlineContainerStyle,
    imgHeightClass,
    inlineImgStyle,
    alignClass,
    caption: fields.caption,
  };
};

// Render Lexical AST directly when HTML is not pre-rendered
const renderLexicalNode = (node: any, key: string | number): React.ReactNode => {
  if (!node) return null;

  switch (node.type) {
    case 'text': {
      let content: React.ReactNode = node.text || '';
      const format = node.format || 0;
      if (format & 1) content = <strong>{content}</strong>;
      if (format & 2) content = <em>{content}</em>;
      if (format & 4) content = <s>{content}</s>;
      if (format & 8) content = <u>{content}</u>;
      if (format & 16) content = <code className="bg-gray-100 px-1 py-0.5 rounded text-[10px] font-mono">{content}</code>;
      if (format & 32) content = <sub>{content}</sub>;
      if (format & 64) content = <sup>{content}</sup>;
      return <span key={key}>{content}</span>;
    }

    case 'paragraph': {
      const alignClass = node.format === 'center' ? 'text-center' : node.format === 'right' ? 'text-right' : node.format === 'justify' ? 'text-justify' : 'text-left';
      const hasImages = node.children?.some((child: any) => child.type === 'upload' || child.type === 'image');
      if (hasImages) {
        return (
          <div key={key} className={`my-2 print:my-1 flex flex-wrap items-start gap-2.5 print:gap-1.5 w-full ${alignClass === 'text-center' ? 'justify-center' : alignClass === 'text-right' ? 'justify-end' : 'justify-start'}`}>
            {node.children?.map((child: any, i: number) => renderLexicalNode(child, i))}
          </div>
        );
      }
      return (
        <p key={key} className={`mb-2 print:mb-1 last:mb-0 ${alignClass}`}>
          {node.children?.map((child: any, i: number) => renderLexicalNode(child, i))}
        </p>
      );
    }

    case 'heading': {
      const tag = node.tag || 'h2';
      const alignClass = node.format === 'center' ? 'text-center' : node.format === 'right' ? 'text-right' : 'text-left';
      const className = `text-sm print:text-xs font-bold uppercase tracking-wider text-[#005288] mt-3 mb-1.5 print:mt-1.5 print:mb-1 ${alignClass}`;
      const children = node.children?.map((child: any, i: number) => renderLexicalNode(child, i));
      if (tag === 'h1') return <h1 key={key} className={className}>{children}</h1>;
      if (tag === 'h3') return <h3 key={key} className={className}>{children}</h3>;
      if (tag === 'h4') return <h4 key={key} className={className}>{children}</h4>;
      if (tag === 'h5') return <h5 key={key} className={className}>{children}</h5>;
      if (tag === 'h6') return <h6 key={key} className={className}>{children}</h6>;
      return <h2 key={key} className={className}>{children}</h2>;
    }

    case 'link': {
      const href = node.fields?.url || node.url || '#';
      return (
        <a key={key} href={href} target={node.fields?.newTab ? '_blank' : undefined} rel="noreferrer" className="text-[#005288] underline font-medium">
          {node.children?.map((child: any, i: number) => renderLexicalNode(child, i))}
        </a>
      );
    }

    case 'list': {
      const isOrdered = node.listType === 'number';
      const ListTag = isOrdered ? 'ol' : 'ul';
      return (
        <ListTag key={key} className={`my-2 print:my-1 pl-5 ${isOrdered ? 'list-decimal' : 'list-disc'} text-gray-700 text-xs print:text-[9.5px] space-y-0.5`}>
          {node.children?.map((child: any, i: number) => renderLexicalNode(child, i))}
        </ListTag>
      );
    }

    case 'listitem': {
      return (
        <li key={key}>
          {node.children?.map((child: any, i: number) => renderLexicalNode(child, i))}
        </li>
      );
    }

    case 'table': {
      return (
        <div key={key} className="overflow-x-auto my-3 print:my-1.5 border border-gray-200">
          <table className="w-full text-left text-xs print:text-[9.5px] font-mono border-collapse">
            <tbody>
              {node.children?.map((child: any, i: number) => renderLexicalNode(child, i))}
            </tbody>
          </table>
        </div>
      );
    }

    case 'tablerow': {
      return (
        <tr key={key} className="border-b border-gray-200 last:border-b-0 hover:bg-blue-50/20 transition-colors">
          {node.children?.map((child: any, i: number) => renderLexicalNode(child, i))}
        </tr>
      );
    }

    case 'tablecell':
    case 'tableheadercell': {
      const isHeader = (node.headerState && node.headerState > 0) || node.type === 'tableheadercell';
      if (isHeader) {
        return (
          <th
            key={key}
            colSpan={node.colSpan || 1}
            rowSpan={node.rowSpan || 1}
            className="py-2 px-3 print:py-0.5 print:px-2 border-r border-gray-200 last:border-r-0 font-semibold text-gray-700 bg-gray-50/80 uppercase text-[11px] print:text-[9px] tracking-wide align-top"
          >
            {node.children?.map((child: any, i: number) => renderLexicalNode(child, i))}
          </th>
        );
      }
      return (
        <td
          key={key}
          colSpan={node.colSpan || 1}
          rowSpan={node.rowSpan || 1}
          className="py-2 px-3 print:py-0.5 print:px-2 border-r border-gray-200 last:border-r-0 text-gray-900 font-mono text-xs print:text-[9.5px] align-top"
        >
          {node.children?.map((child: any, i: number) => renderLexicalNode(child, i))}
        </td>
      );
    }

    case 'upload': {
      const mediaUrl = getImageUrl(node.value);
      const {
        containerWidthClass,
        inlineContainerStyle,
        imgHeightClass,
        inlineImgStyle,
        alignClass,
        caption,
      } = resolveImageStyles(node);

      return (
        <div
          key={key}
          className={`my-1.5 print:my-0.5 flex flex-col align-top box-border ${containerWidthClass} ${alignClass}`}
          style={inlineContainerStyle}
        >
          {mediaUrl && (
            <img
              src={mediaUrl}
              alt={node.value?.alt || node.value?.filename || 'Custom illustration'}
              className={`w-auto max-w-full object-contain border border-gray-200 p-1 bg-white ${imgHeightClass}`}
              style={inlineImgStyle}
            />
          )}
          {caption && (
            <p className="text-[10px] text-gray-400 mt-1 font-mono text-center w-full">{caption}</p>
          )}
        </div>
      );
    }

    case 'image': {
      const imgSrc = node.src || getImageUrl(node.image);
      const {
        containerWidthClass,
        inlineContainerStyle,
        imgHeightClass,
        inlineImgStyle,
        alignClass,
        caption,
      } = resolveImageStyles(node);

      return (
        <div
          key={key}
          className={`my-1.5 print:my-0.5 flex flex-col align-top box-border ${containerWidthClass} ${alignClass}`}
          style={inlineContainerStyle}
        >
          {imgSrc && (
            <img
              src={imgSrc}
              alt={node.altText || caption || 'Pasted diagram'}
              className={`w-auto max-w-full object-contain border border-gray-200 p-1 bg-white ${imgHeightClass}`}
              style={inlineImgStyle}
            />
          )}
          {caption && (
            <p className="text-[10px] text-gray-400 mt-1 font-mono text-center w-full">{caption}</p>
          )}
        </div>
      );
    }

    case 'horizontalrule':
      return <hr key={key} className="my-4 print:my-2 border-gray-200" />;

    case 'quote':
      return (
        <blockquote key={key} className="border-l-4 border-[#005288] pl-3 py-1 italic text-gray-600 my-2 print:my-1 text-xs print:text-[9.5px]">
          {node.children?.map((child: any, i: number) => renderLexicalNode(child, i))}
        </blockquote>
      );

    default:
      if (node.children && Array.isArray(node.children)) {
        return (
          <div key={key}>
            {node.children.map((child: any, i: number) => renderLexicalNode(child, i))}
          </div>
        );
      }
      return null;
  }
};

const CustomContentRenderer = ({ blk }: { blk: any }) => {
  const root = blk.content?.root;

  // Prioritize rich AST renderer whenever available so user dimensions and row layouts are honored
  if (root && root.children && Array.isArray(root.children) && root.children.length > 0) {
    const groupedNodes: React.ReactNode[] = [];
    let currentImageGroup: any[] = [];

    const flushImageGroup = (groupKey: string) => {
      if (currentImageGroup.length === 0) return;
      if (currentImageGroup.length === 1 && currentImageGroup[0].fields?.width === '100%') {
        groupedNodes.push(renderLexicalNode(currentImageGroup[0], `img-${groupKey}`));
      } else {
        groupedNodes.push(
          <div
            key={`img-group-${groupKey}`}
            className="flex flex-wrap items-start gap-2.5 print:gap-1.5 w-full my-1.5 print:my-0.5"
          >
            {currentImageGroup.map((imgNode, idx) => renderLexicalNode(imgNode, `grouped-img-${groupKey}-${idx}`))}
          </div>
        );
      }
      currentImageGroup = [];
    };

    root.children.forEach((child: any, idx: number) => {
      if (child.type === 'upload' || child.type === 'image') {
        const isFull = child.fields?.width === '100%' || child.fields?.width === 'full';
        if (isFull) {
          flushImageGroup(`${idx}-before`);
          groupedNodes.push(renderLexicalNode(child, idx));
        } else {
          currentImageGroup.push(child);
        }
      } else {
        flushImageGroup(`${idx}`);
        groupedNodes.push(renderLexicalNode(child, idx));
      }
    });
    flushImageGroup('end');

    return (
      <div className="datasheet-custom-rich-text text-xs print:text-[9.5px] text-gray-800 leading-relaxed font-sans flex flex-col gap-2 print:gap-1">
        {groupedNodes}
      </div>
    );
  }

  if (blk.content_html) {
    return (
      <div
        className="datasheet-custom-rich-text text-xs print:text-[9.5px] text-gray-800 leading-relaxed font-sans"
        dangerouslySetInnerHTML={{ __html: blk.content_html }}
      />
    );
  }

  if (typeof blk.content === 'string') {
    return (
      <p className="text-xs print:text-[9.5px] text-gray-700 leading-relaxed font-light whitespace-pre-line">
        {blk.content}
      </p>
    );
  }

  return null;
};

const parseCCT = (cctStr: string): string[] => {
  if (!cctStr || cctStr === '—') return [];
  const cleaned = String(cctStr).replace(/\bDUAL\b/i, '').trim();
  if (cleaned.includes('-') && !cleaned.includes('/')) {
    return [cleaned.replace(/[kK\s]/g, '').trim()];
  }
  if (/[\/,;]/.test(cleaned)) {
    return cleaned
      .split(/[\/,;]+/)
      .map(s => s.replace(/[kK\s]/g, '').trim())
      .filter(Boolean);
  }
  const single = cleaned.replace(/[kK\s]/g, '').trim();
  return single ? [single] : [];
};

const parseFlux = (fluxStr: string, ccts: string[]): string[] => {
  if (!fluxStr || fluxStr === '—') return [];
  const str = String(fluxStr).trim();

  // If contains '@' segment (e.g. '750/440 @2700K 780/450 @3000K...')
  if (/@/.test(str)) {
    const re = /([0-9\/\.\-]+)\s*@([0-9a-zA-Z\/\.\-]+)/g;
    const matches: { val: string; at: string }[] = [];
    let m;
    while ((m = re.exec(str)) !== null) {
      matches.push({ val: m[1].trim(), at: m[2].trim() });
    }

    if (matches.length > 0) {
      if (ccts && ccts.length > 1) {
        return ccts.map((cct) => {
          const found = matches.find((item) => item.at.includes(cct));
          if (found) return found.val;
          const foundLoose = matches.find((item) => item.at.replace(/[^\d]/g, '').includes(cct));
          if (foundLoose) return foundLoose.val;
          return matches[0]?.val || '—';
        });
      }
      return matches.map(m => m.val);
    }
  }

  // If no '@', but has '/' and count matches CCT count (e.g. 1700/1800/1700)
  if (ccts && ccts.length > 1 && str.includes('/')) {
    const parts = str.split('/').map(p => p.replace(/\s*lm\b/gi, '').trim()).filter(Boolean);
    if (parts.length === ccts.length) {
      return parts;
    }
  }

  // If single value with multiple CCTs, repeat it for each line so lines stay aligned
  const single = str.replace(/\s*lm\b/gi, '').trim();
  if (ccts && ccts.length > 1 && single && !single.includes('\n')) {
    return ccts.map(() => single);
  }

  return [single];
};

const getRawSpecValue = (sku: any, paramKey: string): string => {
  const specs = sku.specifications || {};
  const parent = typeof sku.product === 'object' && sku.product !== null ? sku.product : null;
  const parentSpecs = parent?.specifications || {};

  const findVal = (keys: string[]): string => {
    for (const k of keys) {
      if (sku[k] !== undefined && sku[k] !== null && String(sku[k]).trim() !== '') return String(sku[k]);
      if (specs[k] !== undefined && specs[k] !== null && String(specs[k]).trim() !== '') return String(specs[k]);
      if (parent && parent[k] !== undefined && parent[k] !== null && String(parent[k]).trim() !== '') return String(parent[k]);
      if (parentSpecs[k] !== undefined && parentSpecs[k] !== null && String(parentSpecs[k]).trim() !== '') return String(parentSpecs[k]);
    }
    return '—';
  };

  switch (paramKey) {
    case 'colourTemperature':
      return findVal(['colourTemperature', 'cct_k', 'CCT']);
    case 'luminousFlux':
      return findVal(['total_luminous_flux_lm', 'useful_luminous_flux_lm', 'luminousFlux', 'flux']);
    default:
      return findVal([paramKey]);
  }
};

const getSpecValue = (sku: any, paramKey: string): string => {
  const specs = sku.specifications || {};
  const parent = typeof sku.product === 'object' && sku.product !== null ? sku.product : null;
  const parentSpecs = parent?.specifications || {};

  const findVal = (keys: string[]): string => {
    for (const k of keys) {
      if (sku[k] !== undefined && sku[k] !== null && String(sku[k]).trim() !== '') return String(sku[k]);
      if (specs[k] !== undefined && specs[k] !== null && String(specs[k]).trim() !== '') return String(specs[k]);
      if (parent && parent[k] !== undefined && parent[k] !== null && String(parent[k]).trim() !== '') return String(parent[k]);
      if (parentSpecs[k] !== undefined && parentSpecs[k] !== null && String(parentSpecs[k]).trim() !== '') return String(parentSpecs[k]);
    }
    return '—';
  };

  switch (paramKey) {
    case 'mmCode':
      return sku.name || '—';
    case 'modelNo':
      return findVal(['customer_model_no_new', 'model_number', 'yk_model_no', 'model_identifier', 'modelNo', 'name']);
    case 'optionCode':
      return findVal(['optionCode', 'option_code', 'yk_product_code']);
    case 'colour':
      return findVal(['fitting_colour', 'colour', 'color', 'luminaires_color']);
    case 'wattage': {
      const w = findVal(['on_mode_power_w', 'power', 'wattage']);
      return w !== '—' ? w.replace(/\s*w\b/gi, '').trim() : '—';
    }
    case 'luminousFlux': {
      const f = findVal(['total_luminous_flux_lm', 'useful_luminous_flux_lm', 'luminousFlux', 'flux']);
      return f !== '—' ? f.replace(/\s*lm\b/gi, '').trim() : '—';
    }
    case 'colourTemperature': {
      const c = findVal(['colourTemperature', 'cct_k', 'CCT']);
      return c !== '—' ? c.replace(/[kK\s]/g, '').trim() : '—';
    }
    case 'cri': {
      const r = findVal(['ra', 'cri', 'CRI']);
      return r !== '—' ? r.replace(/^ra\s*/i, '').trim() : '—';
    }
    case 'efficacy': {
      const e = findVal(['total_mains_efficacy_lmw', 'efficacy', 'luminous_efficacy']);
      return e !== '—' ? e.replace(/\s*(?:lm\/w|lmw)\b/gi, '').trim() : '—';
    }
    case 'beamAngle': {
      const b = findVal(['beam_angle', 'beamAngle', 'beam_angle_deg']);
      return b !== '—' ? b.replace(/°|\s*deg\b/gi, '').trim() : '—';
    }
    case 'ip': {
      const ipVal = findVal(['ip', 'ipRating', 'ip_rating']);
      return ipVal !== '—' && !ipVal.toUpperCase().startsWith('IP') ? `IP${ipVal}` : ipVal;
    }
    case 'ik':
      return findVal(['ik', 'ik_rating', 'IK']);
    case 'controlGear':
      return findVal(['control_gear', 'driver_type', 'driver_model', 'type_terminal block', 'controlGear', 'connector']);
    case 'connector':
      return findVal(['connector', 'type_terminal block']);
    case 'dimmingType':
      return findVal(['dimming_type', 'dimmable']);
    case 'dimmingRange':
      return findVal(['dimming_range']);
    case 'voltage': {
      const v = findVal(['rated_voltage_v', 'voltage']);
      return v !== '—' ? v.replace(/\s*v\b/gi, '').trim() : '—';
    }
    case 'frequency': {
      const fq = findVal(['frequency_hz', 'frequency']);
      return fq !== '—' ? fq.replace(/\s*hz\b/gi, '').trim() : '—';
    }
    case 'inputCurrent': {
      const ic = findVal(['input_current_ma']);
      return ic !== '—' ? ic.replace(/\s*ma\b/gi, '').trim() : '—';
    }
    case 'powerFactor': {
      const pf = findVal(['power_factor']);
      return pf !== '—' ? pf : '—';
    }
    case 'lampBase':
      return findVal(['lamp_base', 'lampBase']);
    case 'dimensions': {
      const dm = findVal(['dimensions', 'dimension_mm', 'diameter_mm']);
      return dm !== '—' ? dm.replace(/\s*\(?mm\)?\b/gi, '').trim() : '—';
    }
    case 'recessedCutOut': {
      const co = findVal(['recessed_cut_out', 'cut_out_mm', 'recessed_cut_out_mm']);
      return co !== '—' ? co.replace(/\s*mm\b/gi, '').trim() : '—';
    }
    case 'weight': {
      const wt = findVal(['net_weight_g', 'weight']);
      return wt !== '—' ? wt.replace(/\s*g\b/gi, '').trim() : '—';
    }
    case 'lifetime': {
      const lt = findVal(['norminal_life_h', 'lifetime']);
      return lt !== '—' ? lt.replace(/\s*(?:h|hrs|hours)\b/gi, '').trim() : '—';
    }
    case 'switchingCycles':
      return findVal(['switching_cycles', 'switching_Cycles']);
    case 'energyClass':
      return findVal(['energy_efficiency_class']);
    case 'protectionClass':
      return findVal(['protection_class']);
    case 'glowWire': {
      const gw = findVal(['glow_wire']);
      return gw !== '—' ? gw.replace(/°c|°|\s*degc\b/gi, '').trim() : '—';
    }
    case 'housingMaterial':
      return findVal(['housing_material']);
    case 'diffuserMaterial':
      return findVal(['diffuser_material']);
    case 'operatingTemperature': {
      const ot = findVal(['operating_temperature']);
      return ot !== '—' ? ot.replace(/°c/gi, '').trim() : '—';
    }
    case 'symbols': {
      if (sku.symbols && Array.isArray(sku.symbols)) {
        return sku.symbols.map((s: any) => (typeof s === 'object' ? s.name : s)).filter(Boolean).join(', ') || '—';
      }
      return '—';
    }
    default:
      return findVal([paramKey]);
  }
};

const getFamilySpecValue = (skus: any[], family: any, paramKey: string): string => {
  if (paramKey === 'symbols') {
    if (family.symbols && Array.isArray(family.symbols) && family.symbols.length > 0) {
      return family.symbols
        .map((s: any) => (typeof s === 'object' ? s.name : s))
        .filter(Boolean)
        .join(', ');
    }
  }

  const values = skus
    .map((sku) => getSpecValue(sku, paramKey))
    .filter((v) => v && v !== '—');

  const unique = Array.from(new Set(values));

  if (unique.length === 1) {
    return unique[0];
  }

  if (unique.length > 1) {
    if (unique.length <= 4) {
      return unique.join(' / ');
    }
    return `${unique[0]} … ${unique[unique.length - 1]} (${unique.length} variants)`;
  }

  if (family.description && typeof family.description === 'string') {
    const label = PARAM_LABELS[paramKey] || paramKey;
    const { name: paramName } = splitParamAndUnit(label);
    const regex = new RegExp(`(?:${paramName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}|${paramKey})\\s*[:：]\\s*([^\\n\\r,;]+)`, 'i');
    const match = family.description.match(regex);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return '—';
};

async function getFamily(id: string): Promise<any> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    const response = await fetch(`${payloadUrl}/api/families/${id}?depth=3`, {
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching family:', error);
    return null;
  }
}

async function getFamilySKUs(familyId: string, productIds: string[]): Promise<any[]> {
  try {
    const payloadUrl = process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000';
    if (!productIds || productIds.length === 0) return [];
    
    // Fetch SKUs for products belonging to this family
    const query = productIds.map(pid => `where[product][in][]=${pid}`).join('&');
    const response = await fetch(`${payloadUrl}/api/skus?${query}&limit=200&depth=2`, {
      cache: 'no-store',
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching family SKUs:', error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const family = await getFamily(resolvedParams.id);
  const title = family?.datasheet?.title || family?.name || 'Family Datasheet';
  return {
    title: `${title} - Family Datasheet | MEGAMAN®`,
    description: family?.datasheet?.subtitle || family?.description || 'Family technical specifications datasheet.',
  };
}

export default async function FamilyDatasheetPage({ params }: PageProps) {
  const resolvedParams = await params;
  const family = await getFamily(resolvedParams.id);

  if (!family) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50 text-gray-500 font-sans">
        <div className="text-center">
          <h1 className="text-xl font-bold mb-2">Family Not Found</h1>
          <p className="text-sm">The product family datasheet could not be found.</p>
        </div>
      </div>
    );
  }

  const productIds = (family.products || []).map((p: any) => (typeof p === 'object' ? p.id : p)).filter(Boolean);
  const skus = await getFamilySKUs(family.id, productIds);

  const datasheet = family.datasheet || {};
  const isEnabled = datasheet.enabled !== false;
  const pages: any[] = isEnabled && datasheet.pages && datasheet.pages.length > 0
    ? datasheet.pages
    : [
        {
          pageNumber: 1,
          tables: [
            {
              tableType: 'horizontal',
              tableName: `${family.name} Technical Specifications`,
              selectedParameters: family.selectedParameters || [
                'mmCode',
                'modelNo',
                'colour',
                'wattage',
                'luminousFlux',
                'colourTemperature',
                'cri',
                'efficacy',
                'ip',
                'controlGear',
              ],
            },
          ],
        },
      ];

  const seriesTitle = datasheet.title || family.name;
  const seriesSubtitle = datasheet.subtitle || family.description || '';

  return (
    <div className="min-h-screen print:min-h-0 bg-neutral-100 py-6 print:py-0 print:bg-white text-gray-900 font-sans print:m-0 print:p-0">
      {/* Inline Print Styles ensuring exact A4 sizing & repeated header/footer on every page */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm;
          }
          header, nav, .site-header, .no-print {
            display: none !important;
          }
          html, body, main {
            background: #ffffff !important;
            color: #111827 !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .datasheet-a4-page {
            box-sizing: border-box !important;
            width: 100% !important;
            height: 275mm !important;
            min-height: 275mm !important;
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            box-shadow: none !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
          }
          .datasheet-a4-page:last-child {
            break-after: auto !important;
            page-break-after: auto !important;
          }
          .datasheet-custom-rich-text table {
            width: 100% !important;
            border-collapse: collapse !important;
            margin-top: 0.25rem !important;
            margin-bottom: 0.25rem !important;
            font-size: 9.5px !important;
          }
          .datasheet-custom-rich-text th,
          .datasheet-custom-rich-text td {
            border: 1px solid #e5e7eb !important;
            padding: 2px 6px !important;
            vertical-align: top !important;
          }
          .datasheet-custom-rich-text th {
            background-color: #f3f4f6 !important;
            font-weight: 700 !important;
            text-transform: uppercase !important;
            color: #374151 !important;
            font-size: 9px !important;
            letter-spacing: 0.05em !important;
          }
          .datasheet-custom-rich-text img {
            max-width: 100% !important;
            max-height: 45mm !important;
            object-fit: contain !important;
            margin: 2px auto !important;
            display: inline-block !important;
            vertical-align: top !important;
          }
          tr {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      <div className="max-w-[1100px] mx-auto px-4 print:px-0 print:max-w-none print:w-full print:m-0">
        
        {/* Print / Navigation Bar */}
        <FamilyPrintController familyId={family.id} seriesTitle={seriesTitle} />

        {/* Datasheet Document Container */}
        <div className="flex flex-col gap-8 print:gap-0 print:block">
          {pages.map((page: any, pageIdx: number) => {
            const pageNum = page.pageNumber || pageIdx + 1;
            const tables = page.tables || [];
            const contents = page.pageContents || [];

            return (
              <div
                key={`page-${pageIdx}`}
                className="datasheet-a4-page bg-white p-8 md:p-12 print:p-0 shadow-sm border border-gray-200 print:border-none print:shadow-none min-h-[1050px] flex flex-col justify-between mb-8 print:mb-0"
                style={{
                  breakAfter: pageIdx < pages.length - 1 ? 'page' : 'auto',
                  pageBreakAfter: pageIdx < pages.length - 1 ? 'always' : 'auto',
                }}
              >
                {/* Upper Section: Page Header and Content */}
                <div className="flex-1 flex flex-col">
                  {/* Page Header */}
                  <div className="flex justify-between items-start pb-6 print:pb-3 border-b-2 border-[#005288] mb-8 print:mb-4">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#005288] mb-1">
                        Product Family Datasheet
                      </div>
                      <h1 className="text-2xl md:text-3xl print:text-xl font-light uppercase tracking-widest text-gray-900">
                        {seriesTitle}
                      </h1>
                      {seriesSubtitle && (
                        <p className="text-xs print:text-[10px] text-gray-500 mt-1 max-w-xl font-light leading-relaxed">
                          {seriesSubtitle}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="text-xl print:text-lg font-bold tracking-wider text-[#005288]">MEGAMAN®</div>
                      <div className="text-[10px] font-mono text-gray-400 mt-1">
                        PAGE {pageNum} OF {pages.length}
                      </div>
                    </div>
                  </div>

                  {/* Specification Tables for this Page */}
                  {tables.map((table: any, tIdx: number) => {
                    const tableName = table.tableName || `Table ${tIdx + 1}`;
                    const tableDesc = table.tableDescription;
                    const footnote = table.tableFootnote;
                    const isVertical = table.tableType === 'vertical';

                    // Prepare rows for Type 1 (Vertical Table: Parameter header in 1st column, single value column next to it)
                    const verticalRows: { label: string; value: string; pKey?: string }[] = [];
                    if (isVertical) {
                      const selectedParams: string[] = table.selectedParameters || [
                        'voltage',
                        'frequency',
                        'ip',
                        'ik',
                        'protectionClass',
                        'housingMaterial',
                        'operatingTemperature',
                        'lifetime',
                      ];

                      // 1. Add selected parameters resolved across SKUs / family
                      selectedParams.forEach((pKey) => {
                        verticalRows.push({
                          pKey,
                          label: PARAM_LABELS[pKey] || pKey,
                          value: getFamilySpecValue(skus, family, pKey),
                        });
                      });

                      // 2. Add custom parameter-value rows if defined in CMS
                      if (table.customRows && Array.isArray(table.customRows)) {
                        table.customRows.forEach((cr: any) => {
                          if (cr?.parameter) {
                            verticalRows.push({
                              label: cr.parameter,
                              value: cr.value || '—',
                            });
                          }
                        });
                      }
                    }

                    // Parameters for Type 2 (Horizontal Table: Parameter headers in 1st row, models in rows below)
                    const horizontalParams: string[] = table.selectedParameters || [
                      'mmCode',
                      'modelNo',
                      'wattage',
                      'luminousFlux',
                      'colourTemperature',
                      'ip',
                    ];

                    const renderSkuCell = (sku: any, pKey: string) => {
                      if (pKey === 'colourTemperature') {
                        const rawCct = getRawSpecValue(sku, 'colourTemperature');
                        const ccts = parseCCT(rawCct);
                        if (ccts.length > 1) {
                          return (
                            <div className="flex flex-col">
                              {ccts.map((c, i) => (
                                <div key={i} className="py-1 border-b border-gray-100 last:border-b-0 whitespace-nowrap leading-tight text-center md:text-left">
                                  {c}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return <span>{ccts[0] || getSpecValue(sku, 'colourTemperature')}</span>;
                      }

                      if (pKey === 'luminousFlux') {
                        const rawCct = getRawSpecValue(sku, 'colourTemperature');
                        const rawFlux = getRawSpecValue(sku, 'luminousFlux');
                        const ccts = parseCCT(rawCct);
                        const fluxes = parseFlux(rawFlux, ccts);
                        if (ccts.length > 1 || fluxes.length > 1) {
                          return (
                            <div className="flex flex-col">
                              {fluxes.map((f, i) => (
                                <div key={i} className="py-1 border-b border-gray-100 last:border-b-0 whitespace-nowrap leading-tight text-center md:text-left">
                                  {f}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return <span>{fluxes[0] || getSpecValue(sku, 'luminousFlux')}</span>;
                      }

                      return <span>{getSpecValue(sku, pKey)}</span>;
                    };

                    const renderVerticalCellValue = (row: { label: string; value: string; pKey?: string }) => {
                      if (row.pKey === 'colourTemperature' || /cct|colour\s*temp/i.test(row.label)) {
                        const ccts = parseCCT(row.value);
                        if (ccts.length > 1) {
                          return (
                            <div className="flex flex-col">
                              {ccts.map((c, i) => (
                                <div key={i} className="py-1 border-b border-gray-100 last:border-b-0 leading-tight">
                                  {c}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return <span>{ccts[0] || row.value}</span>;
                      }

                      if (row.pKey === 'luminousFlux' || /luminous\s*flux|flux/i.test(row.label)) {
                        const fluxes = parseFlux(row.value, []);
                        if (fluxes.length > 1) {
                          return (
                            <div className="flex flex-col">
                              {fluxes.map((f, i) => (
                                <div key={i} className="py-1 border-b border-gray-100 last:border-b-0 leading-tight">
                                  {f}
                                </div>
                              ))}
                            </div>
                          );
                        }
                        return <span>{fluxes[0] || row.value}</span>;
                      }

                      const { unit } = splitParamAndUnit(row.label);
                      let val = row.value;
                      if (unit && val && val !== '—') {
                        const cleanUnit = unit.replace(/[()[\]]/g, '').trim();
                        if (cleanUnit) {
                          const regex = new RegExp(`\\s*${cleanUnit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
                          val = val.replace(regex, '').trim();
                        }
                      }

                      return <span>{val}</span>;
                    };

                    return (
                      <div key={`table-${tIdx}`} className="mb-8 print:mb-3">
                        {/* Table Heading */}
                        <div className="mb-3 print:mb-1">
                          <h2 className="text-sm print:text-xs font-bold uppercase tracking-wider text-[#005288]">
                            {tableName}
                          </h2>
                          {tableDesc && (
                            <p className="text-xs print:text-[10px] text-gray-500 font-light mt-0.5">
                              {tableDesc}
                            </p>
                          )}
                        </div>

                        {/* Render Table based on Type */}
                        {isVertical ? (
                          /* Type 1: Vertical Table (Parameter header is in the first column, single value column next to it) */
                          <div className="overflow-x-auto border border-gray-200">
                            <table className="w-full text-left text-xs print:text-[9.5px] font-mono border-collapse">
                              <thead>
                                <tr className="bg-gray-100 border-b border-gray-300 text-[11px] print:text-[9px] font-bold text-gray-700 uppercase tracking-wider">
                                  <th className="py-2.5 px-4 print:py-0.5 print:px-2 border-r border-gray-200 w-2/5 md:w-1/3">
                                    Parameter
                                  </th>
                                  <th className="py-2.5 px-4 print:py-0.5 print:px-2">
                                    Value
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {verticalRows.length === 0 ? (
                                  <tr>
                                    <td colSpan={2} className="text-center py-6 print:py-2 text-gray-400">
                                      No parameters configured for this table.
                                    </td>
                                  </tr>
                                ) : (
                                  verticalRows.map((row, rIdx) => {
                                    const rowBg = rIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50';
                                    return (
                                      <tr key={rIdx} className={`${rowBg} hover:bg-blue-50/30 transition-colors`}>
                                        <th
                                          scope="row"
                                          className="py-2.5 px-4 print:py-0.5 print:px-2 border-r border-gray-200 font-semibold text-gray-700 bg-gray-50/80 uppercase text-[11px] print:text-[9px] tracking-wide text-left align-middle w-2/5 md:w-1/3"
                                        >
                                          {row.label}
                                        </th>
                                        <td className="py-2.5 px-4 print:py-0.5 print:px-2 text-gray-900 font-mono text-xs print:text-[9.5px] align-middle">
                                          {renderVerticalCellValue(row)}
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          /* Type 2: Horizontal Table (Parameter header is on the first row, models in rows below) */
                          <div className="overflow-x-auto border border-gray-200">
                            <table className="w-full text-left text-xs print:text-[9.5px] font-mono border-collapse">
                              <thead>
                                <tr className="bg-gray-100 border-b border-gray-300 text-[11px] print:text-[9px] font-bold text-gray-700 uppercase tracking-wider">
                                  {horizontalParams.map((pKey) => (
                                    <th key={pKey} className="py-2.5 px-3 print:py-1 print:px-1.5 border-r border-gray-200 last:border-r-0 whitespace-nowrap align-bottom">
                                      {renderParamHeader(PARAM_LABELS[pKey] || pKey, false)}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200">
                                {skus.length === 0 ? (
                                  <tr>
                                    <td colSpan={horizontalParams.length} className="text-center py-6 print:py-2 text-gray-400">
                                      No models found for this family.
                                    </td>
                                  </tr>
                                ) : (
                                  skus.map((sku: any, sIdx: number) => {
                                    const rowBg = sIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/60';
                                    return (
                                      <tr key={sku.id || sIdx} className={`${rowBg} hover:bg-blue-50/30 transition-colors`}>
                                        {horizontalParams.map((pKey) => (
                                          <td key={pKey} className="py-2 px-3 print:py-0.5 print:px-1.5 border-r border-gray-200 last:border-r-0 whitespace-nowrap text-gray-800 align-middle">
                                            {renderSkuCell(sku, pKey)}
                                          </td>
                                        ))}
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        )}

                        {footnote && (
                          <p className="text-[10px] text-gray-400 mt-1.5 italic font-mono">
                            {footnote}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* Additional Content Blocks on this Page */}
                  {contents.length > 0 && (
                    <div className="mt-8 print:mt-3 pt-6 print:pt-3 border-t border-gray-200 flex flex-col gap-6 print:gap-3">
                      {contents.map((blk: any, bIdx: number) => {
                        switch (blk.blockType) {
                          case 'datasheetCustomContent':
                          case 'datasheetRichText':
                            return (
                              <div key={bIdx} className="p-4 print:p-2.5 border border-gray-200 bg-white">
                                {blk.title && (
                                  <h3 className="text-xs print:text-[11px] font-bold uppercase tracking-wider text-[#005288] mb-2 border-b border-gray-200 pb-1.5">
                                    {blk.title}
                                  </h3>
                                )}
                                <CustomContentRenderer blk={blk} />
                              </div>
                            );
                          case 'datasheetText':
                            return (
                              <div key={bIdx} className="bg-gray-50 p-4 print:p-2.5 border border-gray-200">
                                {blk.title && (
                                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
                                    {blk.title}
                                  </h3>
                                )}
                                <p className="text-xs text-gray-600 leading-relaxed font-light whitespace-pre-line">
                                  {blk.content}
                                </p>
                              </div>
                            );
                          case 'datasheetDrawing':
                            return (
                              <div key={bIdx} className="flex flex-col items-center p-4 border border-gray-200 bg-white">
                                {blk.title && (
                                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#005288] mb-3 self-start">
                                    {blk.title}
                                  </h3>
                                )}
                                <div className="relative w-full max-w-md h-56">
                                  <Image
                                    src={getImageUrl(blk.image)}
                                    alt={blk.caption || 'Dimensional Drawing'}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                  />
                                </div>
                                {blk.caption && (
                                  <p className="text-[11px] text-gray-500 mt-2 text-center font-mono">
                                    {blk.caption}
                                  </p>
                                )}
                              </div>
                            );
                          case 'datasheetPhotometry':
                            return (
                              <div key={bIdx} className="flex flex-col items-center p-4 border border-gray-200 bg-white">
                                {blk.title && (
                                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#005288] mb-3 self-start">
                                    {blk.title}
                                  </h3>
                                )}
                                <div className="relative w-full max-w-sm h-48">
                                  <Image
                                    src={getImageUrl(blk.image)}
                                    alt={blk.caption || 'Photometrics Diagram'}
                                    fill
                                    className="object-contain"
                                    unoptimized
                                  />
                                </div>
                                {blk.caption && (
                                  <p className="text-[11px] text-gray-500 mt-2 text-center font-mono">
                                    {blk.caption}
                                  </p>
                                )}
                              </div>
                            );
                          case 'datasheetFeatures':
                            return (
                              <div key={bIdx} className="p-4 border border-gray-200 bg-white">
                                {blk.title && (
                                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-2">
                                    {blk.title}
                                  </h3>
                                )}
                                <ul className="list-disc list-inside text-xs text-gray-600 space-y-1 font-light">
                                  {(blk.items || []).map((item: any, iIdx: number) => (
                                    <li key={iIdx}>{item.feature}</li>
                                  ))}
                                </ul>
                              </div>
                            );
                          case 'datasheetSymbols':
                            return (
                              <div key={bIdx} className="p-4 border border-gray-200 bg-white">
                                {blk.title && (
                                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 mb-3">
                                    {blk.title}
                                  </h3>
                                )}
                                <div className="flex flex-wrap gap-3 items-center">
                                  {(blk.symbols || []).map((sym: any, sIdx: number) => {
                                    const symName = typeof sym === 'object' ? sym.name : sym;
                                    const iconUrl = typeof sym === 'object' && sym.icon ? getImageUrl(sym.icon) : '';
                                    return (
                                      <div key={sIdx} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 text-xs font-mono">
                                        {iconUrl && iconUrl !== '/placeholder.png' && (
                                          <img src={iconUrl} alt={symName} className="h-4 w-4 object-contain" />
                                        )}
                                        <span>{symName}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          default:
                            return null;
                        }
                      })}
                    </div>
                  )}
                </div>

                {/* Page Footer - Always stuck to bottom */}
                <div className="pt-6 print:pt-2 border-t border-gray-200 flex justify-between items-center text-[10px] text-gray-400 font-mono mt-8 print:mt-auto">
                  <div>
                    {datasheet.notes || 'Specifications are subject to change without prior notice. MEGAMAN® is a registered trademark.'}
                  </div>
                  <div>
                    MEGAMAN® &bull; Page {pageNum} of {pages.length}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
