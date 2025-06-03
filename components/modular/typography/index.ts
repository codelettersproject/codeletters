import TypographyText from './TypographyText';
import TypographyTitle from './TypographyTitle';


const Typography = {
  Text: TypographyText,
  Title: TypographyTitle,
} as const;


export default Object.freeze(Typography) as typeof Typography;
