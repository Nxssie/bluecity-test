import React from 'react';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        marginTop: "1em",
      },
    media: {
        height: 140,
    },
    container: {
        [theme.breakpoints.down('sm')]: {
            margin: "2em",
        },
        [theme.breakpoints.up('md')]: {
            marginLeft: "2em",
            marginRight: "2em"
        },
        [theme.breakpoints.up('lg')]: {
            marginLeft: "16em",
            marginRight: "16em",
            marginBottom: "2em"
        },
    },
}));

export default function MediaCard({changeWebpage}) {
    const classes = useStyles(); 

    return (
        <div className={classes.container}>
            {/* <Divider/> */}
            <Grid container className={classes.root} spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                <div className="tiles-item reveal-from-bottom">
                    <Card className={classes.root}>
                            <CardMedia
                                className={classes.media}
                                image="img/centro1.png"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h2" component="h5">
                                    IES El Rincón
                                 </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                El Instituto de Educación Secundaria  El Rincón está ubicado en la ciudad de Las Palmas de Gran Canaria (Las Palmas, España). 

                                En el centro se puede cursar la ESO, Bachillerato, FP básica, Ciclos superiores y medios de Formación Profesional de la Familia de Informática y Comunicaciones en turnos de diurno (mañana/tarde) y nocturno (semipresencial). 
                                Además posee un aula enclave, para alumnado con necesidades educativas especiales.
                                </Typography>
                            </CardContent>
                        <CardActions>
                            {/* <Button size="small" color="primary" onClick={() => {changeWebpage("rincon")}}> */}
                            <Button size="small" color="primary">
                            Ver más <ArrowForwardIcon/>
                            </Button>
                        </CardActions>
                    </Card>
                    </div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                <div className="tiles-item reveal-from-bottom" data-reveal-delay="200">
                    <Card className={classes.root}>
                            <CardMedia
                                className={classes.media}
                                image="img/centro5.png"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h2" component="h5">
                                    INS Esteve Terradas
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                Estamos situados en el centro de Cornellà de Llobregat (Baix Llobregat), muy cerca de Barcelona y bien comunicado con metro, Renfe, autobuses y Ferrocarriles.

                                El hecho de tener más de 300 empresas colaboradoras, que cada curso se firmen aproximadamente 500 convenios de prácticas, así como las relaciones que mantenemos con empresarios, madres y padres de alumnos y ex-alumnos; 
                                nos autorizan a hacer una valoración positiva del trabajo hecho hasta ahora.
                                </Typography>
                            </CardContent>
                        <CardActions>
                            <Button size="small" color="primary">
                            Ver más <ArrowForwardIcon/>
                            </Button>
                        </CardActions>
                    </Card>
                    </div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                <div className="tiles-item reveal-from-bottom" data-reveal-delay="400">
                    <Card className={classes.root}>
                            <CardMedia
                                className={classes.media}
                                image="img/centro6.png"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h2" component="h5">
                                    Furious Koalas
                                </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                Proporcionamos servicios de alta calidad en las áreas de Gamificación, Juegos Serios, Simuladores y Visión por Computador.

                                Con más de 15 años de experiencia en el seno de los grupos de investigación Oreto y Artificial Intelligence and Representation, pertenecientes a la Universidad de Castilla-La Mancha, Furious Koalas S.L. ofrece resultados profesionales en el contexto del diseño, desarrollo y despliegue de soluciones interactivas.
                                </Typography>
                            </CardContent>
                        <CardActions>
                            <Button size="small" color="primary">
                            Ver más <ArrowForwardIcon/>
                            </Button>
                        </CardActions>
                    </Card>
                    </div>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                <div className="tiles-item reveal-from-bottom" data-reveal-delay="600">
                    <Card className={classes.root}>
                            <CardMedia
                                className={classes.media}
                                image="img/centro4.png"
                            />
                            <CardContent>
                                <Typography gutterBottom variant="h2" component="h5">
                                    INS Bernat el Ferrer
                                    </Typography>
                                <Typography variant="body2" color="textSecondary" component="p">
                                El Instituto Bernat el Ferrer es actualmente un centro donde se imparten enseñanzas de ESO; de bachillerato de las modalidades humanística y social, científica y tecnológica; y ciclos formativos medios y superiores, de las familias administrativa, eléctrica-electrónica e informática. 
                                También se imparte el curso de acceso a ciclos de grado superior (CAS). Se inició su actividad en 1978-79, y fue creado como instituto de Formación Profesional.
                                    </Typography>
                            </CardContent>
                        <CardActions>
                            <Button size="small" color="primary">
                            Ver más <ArrowForwardIcon/>
                            </Button>
                        </CardActions>
                    </Card>
                    </div>
                </Grid>
            </Grid>
        </div>
    );
}